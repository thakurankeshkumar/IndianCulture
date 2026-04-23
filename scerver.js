const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./lib/db");
const State = require("./models/State");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const urlPath = req.originalUrl;
    console.log(`[${timestamp}] ${method} ${urlPath}`);
    next();
});

app.get("/", (req, res) => {
    console.log("Home Page");
    res.sendFile(path.join(PUBLIC_DIR, "index.html"));
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

app.use((req, res) => {
    res.status(404).send("Page not found");
});


app.listen(PORT, () => {
    console.log(`Server is running on PORT:${PORT}`);
});