import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import organizationRoutes from "./routes/organization.routes";
import invitationRoutes from "./routes/invitation.routes";
import boardRoutes from "./routes/board.routes";
import sectionRoutes from "./routes/section.routes";
import issueRoutes from "./routes/issue.routes";
import commentRoutes from "./routes/comment.routes";
import membershipRoutes from "./routes/membership.routes";

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api", invitationRoutes);
app.use("/api", boardRoutes);
app.use("/api", sectionRoutes);
app.use("/api", issueRoutes);
app.use("/api", commentRoutes);
app.use("/api", membershipRoutes);

export default app;