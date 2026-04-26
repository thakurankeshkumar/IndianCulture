const express = require("express");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const session = require("express-session"); // express-session: Middleware to manage user sessions across HTTP requests
const { MongoStore } = require("connect-mongo"); // connect-mongo: Stores session data persistently in MongoDB
const bcrypt = require("bcryptjs"); // bcryptjs: Library for securely hashing and comparing passwords
const connectDB = require("./lib/db");
const State = require("./models/State");
const Groq = require("groq-sdk");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const LOGS_DIR = path.join(__dirname, "logs");
const ADMIN_LOG_FILE = path.join(LOGS_DIR, "admin-actions.log");

// Vercel/Reverse proxy aware settings for secure session cookies
app.set("trust proxy", 1);

// Create logs directory only if it doesn't exist and can be created
// In serverless environments like Vercel, this may fail gracefully
try {
    if (!fs.existsSync(LOGS_DIR)) {
        fs.mkdirSync(LOGS_DIR, { recursive: true });
    }
} catch (error) {
    // Silently fail in serverless environments where persistent storage isn't available
    if (process.env.NODE_ENV !== "production") {
        console.warn("Could not create logs directory:", error.message);
    }
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// MongoDB connection string for session store
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

// ==========================================
// AUTHORIZATION: SESSION CONFIGURATION
// ==========================================
// We configure sessions to keep users logged in securely.
// Cookies store a session ID, while the actual data stays on the server/DB.

const sessionConfig = {
    name: "bharat_admin_sid",
    secret: process.env.SESSION_SECRET || "replace-this-session-secret",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 8,
    },
};

if (mongoUri) {
    sessionConfig.store = MongoStore.create({
        mongoUrl: mongoUri,
        collectionName: "sessions",
        ttl: 8 * 60 * 60, // 8 hours
    });
} else {
    console.warn("No MongoDB URI found for session store. Falling back to MemoryStore.");
}

// Configure session with MongoDB store
app.use(session(sessionConfig));

app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const urlPath = req.originalUrl;
    console.log(`[${timestamp}] ${method} ${urlPath}`);
    next();
});

function logAdminAction(req, action, details = "") {
    const timestamp = new Date().toISOString();
    const actor = req.session?.admin?.username || "unknown";
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown-ip";
    const line = `[${timestamp}] [${actor}] [${ip}] ${action}${details ? ` :: ${details}` : ""}`;

    // Serverless environments are read-only; avoid file writes in production.
    if (process.env.NODE_ENV === "production") {
        console.log(line);
        return;
    }

    fs.appendFile(ADMIN_LOG_FILE, `${line}\n`, (error) => {
        if (error) {
            console.error("Failed to write admin action log:", error.message);
        }
    });
}

// ==========================================
// AUTHORIZATION: MIDDLEWARE (Auth Guard)
// ==========================================
// This middleware checks if a valid admin session exists.
// If it doesn't, the request is rejected with a 401 Unauthorized status.
// This is attached to routes that require authentication to be accessed.
function ensureAdmin(req, res, next) {
    if (!req.session?.admin) {
        return res.status(401).json({ error: "Admin login required" });
    }

    // If authenticated, proceed to the actual route handler
    return next();
}

function toStringArray(value) {
    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value.map((entry) => String(entry).trim()).filter(Boolean);
    }

    if (typeof value === "string") {
        return value
            .split("\n")
            .map((entry) => entry.trim())
            .filter(Boolean);
    }

    return [];
}

function toObjectArray(value) {
    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    return [];
}

function buildStateUpdatePayload(body) {
    return {
        capital: String(body.capital || "").trim(),
        region: String(body.region || "").trim(),
        languages: toStringArray(body.languages),
        famousFor: toStringArray(body.famousFor),
        overview: String(body.overview || "").trim(),
        geography: String(body.geography || "").trim(),
        history: String(body.history || "").trim(),
        bestTimeToVisit: String(body.bestTimeToVisit || "").trim(),
        idealTripDuration: String(body.idealTripDuration || "").trim(),
        cultureHighlights: toStringArray(body.cultureHighlights),
        cuisineHighlights: toStringArray(body.cuisineHighlights),
        economyHighlights: toStringArray(body.economyHighlights),
        travelTips: toStringArray(body.travelTips),
        mustVisit: toObjectArray(body.mustVisit),
        majorFestivals: toObjectArray(body.majorFestivals),
    };
}

app.get("/", (req, res) => {
    console.log("Home Page");
    res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

app.get("/admin", (req, res) => {
    if (req.session?.admin) {
        return res.redirect("/admin/dashboard");
    }

    return res.redirect("/admin/login");
});

app.get("/admin/login", (req, res) => {
    if (req.session?.admin) {
        return res.redirect("/admin/dashboard");
    }

    return res.sendFile(path.join(PUBLIC_DIR, "admin-login.html"));
});

// ==========================================
// AUTHORIZATION: LOGIN ENDPOINT
// ==========================================
app.post("/admin/login", async (req, res) => {
    // 1. Extract username and password from the incoming request body
    const { username, password } = req.body;
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || "";
    const adminPasswordPlain = process.env.ADMIN_PASSWORD;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    let isPasswordValid = false;

    // 3. Verify Password using bcrypt
    // If we have a hash in the env, we compare the entered password to the hash.
    // bcrypt.compare() hashes the entered password and checks if it matches the stored hash safely.
    if (adminPasswordHash) {
        isPasswordValid = await bcrypt.compare(password, adminPasswordHash);
    } else {
        // Fallback for plain text password comparison (less secure, used for dev)
        isPasswordValid = password === adminPasswordPlain;
    }

    // 4. Check if credentials match
    if (username !== adminUsername || !isPasswordValid) {
        logAdminAction(req, "LOGIN_FAILED", `username=${username}`);
        return res.status(401).json({ error: "Invalid admin credentials" });
    }

    // 5. Establish Session
    // We attach admin data to req.session. This creates a secure cookie sent to the browser.
    req.session.admin = {
        username: adminUsername,
        loggedInAt: new Date().toISOString(),
    };

    logAdminAction(req, "LOGIN_SUCCESS");
    
    // Explicitly save session before sending response to ensure cookie is set
    req.session.save((err) => {
        if (err) {
            console.error("Failed to save session:", err.message);
            return res.status(500).json({ error: "Failed to save session" });
        }
        res.json({ ok: true, redirectTo: "/admin/dashboard" });
    });
});

// ==========================================
// AUTHORIZATION: LOGOUT ENDPOINT
// ==========================================
// Protected by ensureAdmin. Clears the session from the DB and browser.
app.post("/admin/logout", ensureAdmin, (req, res) => {
    logAdminAction(req, "LOGOUT");
    
    // 1. Destroy session on the server
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({ error: "Failed to log out" });
        }

        // 2. Clear the session cookie from the user's browser
        res.clearCookie("bharat_admin_sid");
        return res.json({ ok: true, redirectTo: "/admin/login" });
    });
});

app.get("/admin/dashboard", (req, res) => {
    if (!req.session?.admin) {
        return res.redirect("/admin/login");
    }

    return res.sendFile(path.join(PUBLIC_DIR, "admin.html"));
});

// Favicon handler
app.get("/favicon.ico", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "favicon.png"));
});

app.use(express.static(PUBLIC_DIR));

app.get("/state/:statename", (req, res) => {
    const statename = req.params.statename;
    console.log(`State Page: ${statename}`);
    res.sendFile(path.join(PUBLIC_DIR, "state.html"));
});

app.get("/api/state/:statename", async (req, res) => {
    const startTime = Date.now();
    const { statename } = req.params;
    
    console.log(`API Request: GET /api/state/${statename}`); 
    
    try {
        await connectDB();
        console.log(`MongoDB connected`);

        const state = await State.findOne({
            $or: [
                { slug: statename.toLowerCase() },
                { name: new RegExp(`^${statename.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
            ],
        }).lean();

        if (!state) {
            const duration = Date.now() - startTime;
            console.log(`State not found: "${statename}" (${duration}ms)`);
            return res.status(404).json({ error: "State not found" });
        }

        const duration = Date.now() - startTime;
        console.log(`State found: "${state.name}" (${duration}ms)`);
        console.log(`Data size: ${JSON.stringify(state).length} bytes`);

        return res.json(state);
    } catch (err) {
        const duration = Date.now() - startTime;
        console.error(`API Error: ${err.message} (${duration}ms)`);
        return res.status(500).json({ error: "Failed to fetch the details of states" });
    }
});

app.post("/api/chat", async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ error: "Chatbot is currently unavailable. (Missing API Key)" });
        }
        
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        
        const systemPrompt = `You are 'Tour Guide', an expert on Indian culture, heritage, and travel.
You MUST be able to answer user queries regarding traveling to Indian states, their culture, heritage, and traditions.
You MUST provide practical travel advice, including things to carry (packing lists) while traveling to a particular state.
Maintain a polite, welcoming, and culturally respectful tone that matches a premium Indian cultural website.
Keep your answers concise, informative, and formatted clearly. If applicable, use bullet points for readability. Do not use extremely long paragraphs.`;

        // Format history for groq (expecting an array of { role: 'user' | 'assistant', content: string })
        const messages = [
            { role: "system", content: systemPrompt },
            ...(history || []),
            { role: "user", content: message }
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages,
            model: "llama-3.1-8b-instant", // Updated to currently supported model
            temperature: 0.7,
            max_tokens: 1024,
        });

        const reply = chatCompletion.choices[0]?.message?.content || "I apologize, but I am unable to process your request at the moment.";
        
        return res.json({ reply });
    } catch (error) {
        console.error("Chatbot API Error:", error.message);
        return res.status(500).json({ error: "Failed to communicate with Tour Guide" });
    }
});

app.get("/admin/api/me", ensureAdmin, (req, res) => {
    return res.json({ admin: req.session.admin });
});

app.get("/admin/api/states", ensureAdmin, async (req, res) => {
    try {
        await connectDB();
        const states = await State.find({}, { name: 1, slug: 1, updatedAt: 1 })
            .sort({ name: 1 })
            .lean();

        return res.json(states);
    } catch (error) {
        console.error("Failed to list states:", error.message);
        return res.status(500).json({ error: "Failed to list states" });
    }
});

app.get("/admin/api/state/:stateId", ensureAdmin, async (req, res) => {
    try {
        await connectDB();
        const state = await State.findById(req.params.stateId).lean();

        if (!state) {
            return res.status(404).json({ error: "State not found" });
        }

        return res.json(state);
    } catch (error) {
        console.error("Failed to fetch state for admin:", error.message);
        return res.status(500).json({ error: "Failed to fetch state" });
    }
});

app.put("/admin/api/state/:stateId", ensureAdmin, async (req, res) => {
    try {
        await connectDB();

        const payload = buildStateUpdatePayload(req.body);

        const updatedState = await State.findByIdAndUpdate(req.params.stateId, payload, {
            new: true,
            runValidators: true,
        }).lean();

        if (!updatedState) {
            return res.status(404).json({ error: "State not found" });
        }

        logAdminAction(req, "STATE_UPDATED", `state=${updatedState.name}`);
        return res.json({ ok: true, state: updatedState });
    } catch (error) {
        console.error("Failed to update state:", error.message);
        return res.status(400).json({ error: `Failed to update state: ${error.message}` });
    }
});

app.use((req, res) => {
    res.status(404).send("Page Not found");
});


app.listen(PORT, () => {
    console.log(`Server is Runnig ON PORT:${PORT}`);
});
