import { Router } from "express";
import main from "./urls/main";
import tests from "./urls/tests";

const APIRouter = Router();
export default APIRouter;

APIRouter.use('/', main);
APIRouter.use('/test/', tests);
