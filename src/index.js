import { Express } from "express";
import cors from "cors";

const app = Express()

app.use(express.json())
app.use(cors())

app.listen(8800)