import "dotenv/config";
import express from "express";
import cors from "cors";
import { errorMiddleware } from "./common/error.middleware";
import { createQuestionsModule } from "./questions/questions.module";
import { createAnswersModule } from "./answers/answers.module";
import { createMappingModule } from "./mapping/mapping.module";
import { createGradingModule } from "./grading/grading.module";

const app = express();


app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/questions", createQuestionsModule());
app.use("/api/answers", createAnswersModule());
app.use("/api/map", createMappingModule());
app.use("/api/grade", createGradingModule());

app.use(errorMiddleware);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
