const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const Groq = require("groq-sdk");
const connectDB = require("./lib/db");
const State = require("./models/State");
dotenv.config();

const app = express();
const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const ADMIN_TOKEN_COOKIE = "bharat_admin_token";
const ADMIN_TOKEN_MAX_AGE_MS = 1000 * 60 * 60 * 1;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Checks whether the request has a valid admin token.
function ensureAdmin(req, res, next) {
    const admin = getAdminFromRequest(req);
    if (!admin) {
        return res.status(401).json({ error: "Admin login required" });
    }

    req.admin = admin;
    return next();
}

// Reads a single cookie value from the raw request header.
function getCookieValue(req, cookieName) {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
        return "";
    }

    const cookies = cookieHeader.split(";");
    for (const rawCookie of cookies) {
        const cookie = rawCookie.trim();
        if (cookie.startsWith(`${cookieName}=`)) {
            return decodeURIComponent(cookie.slice(cookieName.length + 1));
        }
    }

    return "";
}

// Verifies the admin JWT and returns the session payload.
function getAdminFromRequest(req) {
    const token = getCookieValue(req, ADMIN_TOKEN_COOKIE);
    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return {
            username: decoded.username,
            loggedInAt: decoded.loggedInAt,
        };
    } catch {
        return null;
    }
}

// Normalizes newline-separated or array input into a clean string list.
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

// Normalizes JSON string or array input into a plain object list.
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

// Builds the update payload used by the admin state editor.
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

// Public site routes.
app.get("/", (req, res) => {
    console.log("Home Page");
    res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

app.get("/admin", (req, res) => {
    if (getAdminFromRequest(req)) {
        return res.redirect("/admin/dashboard");
    }
    return res.redirect("/admin/login");
});

app.get("/admin/login", (req, res) => {
    if (getAdminFromRequest(req)) {
        return res.redirect("/admin/dashboard");
    }
    return res.sendFile(path.join(PUBLIC_DIR, "admin-login.html"));
});

// Issues the admin JWT cookie after credentials are validated.
app.post("/admin/login", async (req, res) => {
    const { username, password } = req.body;
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPasswordPlain = process.env.ADMIN_PASSWORD;

    if (!JWT_SECRET) {
        return res.status(500).json({ error: "Server is missing JWT_SECRET" });
    }

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    const isPasswordValid = password === adminPasswordPlain;

    if (username !== adminUsername || !isPasswordValid) {
        return res.status(401).json({ error: "Invalid admin credentials" });
    }

    const admin = {
        username: adminUsername,
        loggedInAt: new Date().toISOString(),
    };

    const token = jwt.sign(admin, JWT_SECRET, { expiresIn: "1h" });

    res.cookie(ADMIN_TOKEN_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: ADMIN_TOKEN_MAX_AGE_MS,
    });

    return res.json({ ok: true, redirectTo: "/admin/dashboard" });
});

// Clears the admin cookie.
app.post("/admin/logout", (req, res) => {
    res.clearCookie(ADMIN_TOKEN_COOKIE);
    return res.json({ ok: true, redirectTo: "/admin/login" });
});

// Serves the admin dashboard only to logged-in admins.
app.get("/admin/dashboard", (req, res) => {
    if (!getAdminFromRequest(req)) {
        return res.redirect("/admin/login");
    }

    return res.sendFile(path.join(PUBLIC_DIR, "admin.html"));
});

app.use(express.static(PUBLIC_DIR));

// Serves the state detail page for any state slug.
app.get("/state/:statename", (req, res) => {
    const statename = req.params.statename;
    console.log(`State Page: ${statename}`);
    res.sendFile(path.join(PUBLIC_DIR, "state.html"));
});

// Fetches a single state document for the public page.
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

// Chat endpoint powered by Groq for travel guidance.
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
Keep your answers concise, informative, and formatted clearly. If applicable, use bullet points for readability. Do not use extremely long paragraphs. just use short answers and if user ask for other topic then refuse them politely and tell them that i am a Tour Guide i can't provide the info about other topics.`;

        const messages = [
            { role: "system", content: systemPrompt },
            ...(history || []),
            { role: "user", content: message }
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages,
            model: "llama-3.1-8b-instant",
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

// Admin API helpers for the dashboard.
app.get("/admin/api/me", ensureAdmin, (req, res) => {
    return res.json({ admin: req.admin });
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
