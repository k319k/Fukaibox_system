import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    // Page routes
    index("routes/_index.tsx"),
    route("sheets/:id", "routes/sheets.$id.tsx"),
    route("ranking", "routes/ranking.tsx"),
    route("tools", "routes/tools._index.tsx"),
    route("settings", "routes/settings.tsx"),
    route("admin", "routes/admin.tsx"),
    route("debug", "routes/debug.tsx"),

    // Auth routes
    route("auth/discord/login", "routes/auth.discord.login.ts"),
    route("auth/discord/callback", "routes/auth.discord.callback.ts"),
    route("auth/logout", "routes/auth.logout.ts"),

    // API routes - Core
    route("api/health", "routes/api.health.ts"),
    route("api/me", "routes/api.me.ts"),
    route("api/users", "routes/api.users.ts"),
    route("api/heartbeat", "routes/api.heartbeat.ts"),
    route("api/settings", "routes/api.settings.ts"),

    // API routes - Sheets
    route("api/sheets", "routes/api.sheets.ts"),
    route("api/sheets/:id", "routes/api.sheets.$id.ts"),
    route("api/sheets/:sheetId/sections", "routes/api.sheets.$sheetId.sections.ts"),

    // API routes - Sections
    route("api/sections/:id", "routes/api.sections.$id.ts"),

    // API routes - Images
    route("api/images", "routes/api.images.ts"),
    route("api/images/:sheetId/upload", "routes/api.images.$sheetId.upload.ts"),
    route("api/images/:id", "routes/api.images.$id.ts"),

    // API routes - Tools
    route("api/tools", "routes/api.tools.ts"),
    route("api/tools/:id", "routes/api.tools.$id.ts"),

    // API routes - Points
    route("api/points/:userId", "routes/api.points.$userId.ts"),

    // API routes - API Keys
    route("api/api-keys", "routes/api.api-keys.ts"),
    route("api/api-keys/:id", "routes/api.api-keys.$id.ts"),

    // API routes - Admin
    route("api/admin/users", "routes/api.admin.users.ts"),
    route("api/admin/users/:id", "routes/api.admin.users.$id.ts"),
] satisfies RouteConfig;
