import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction } from "express";
import { console } from "inspector";

@Injectable()
    export class loggerMidddleware implements NestMiddleware{
       use(req: Request, res: Response, next: NextFunction){
        console.log("Request...")
        next();
       }
    }
