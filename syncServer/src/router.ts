import { Router } from "express";
import main from "./urls/main";

const APIRouter = Router();
export default APIRouter;

APIRouter.use('/', main);
