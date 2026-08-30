import express from "express";

import authRoutes from "./routes/auth.routes";
import organizationRoutes from "./routes/organization.routes";
import invitationRoutes from "./routes/invitation.routes";
import boardRoutes from "./routes/board.routes";
import sectionRoutes from "./routes/section.routes";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api", invitationRoutes);
app.use("/api", boardRoutes);
app.use("/api", sectionRoutes);

export default app;