const express = require("express");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const connectDB = require("./lib/db");
const State = require("./models/State");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const LOGS_DIR = path.join(__dirname, "logs");
const ADMIN_LOG_FILE = path.join(LOGS_DIR, "admin-actions.log");

if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
    session({
        name: "bharat_admin_sid",
        secret: process.env.SESSION_SECRET || "replace-this-session-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 8,
        },
    })
);

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
    const line = `[${timestamp}] [${actor}] [${ip}] ${action}${details ? ` :: ${details}` : ""}\n`;
    fs.appendFile(ADMIN_LOG_FILE, line, (error) => {
        if (error) {
            console.error("Failed to write admin action log:", error.message);
        }
    });
}

function ensureAdmin(req, res, next) {
    if (!req.session?.admin) {
        return res.status(401).json({ error: "Admin login required" });
    }

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

app.post("/admin/login", async (req, res) => {
    const { username, password } = req.body;
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || "";
    const adminPasswordPlain = process.env.ADMIN_PASSWORD;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    let isPasswordValid = false;

    if (adminPasswordHash) {
        isPasswordValid = await bcrypt.compare(password, adminPasswordHash);
    } else {
        isPasswordValid = password === adminPasswordPlain;
    }

    if (username !== adminUsername || !isPasswordValid) {
        logAdminAction(req, "LOGIN_FAILED", `username=${username}`);
        return res.status(401).json({ error: "Invalid admin credentials" });
    }

    req.session.admin = {
        username: adminUsername,
        loggedInAt: new Date().toISOString(),
    };

    logAdminAction(req, "LOGIN_SUCCESS");
    return res.json({ ok: true, redirectTo: "/admin/dashboard" });
});

app.post("/admin/logout", ensureAdmin, (req, res) => {
    logAdminAction(req, "LOGOUT");
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({ error: "Failed to log out" });
        }

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