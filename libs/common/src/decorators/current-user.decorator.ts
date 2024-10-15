import { createParamDecorator } from "@nestjs/common";
import { JwtPayload } from "@auth/interfaces";
import { ExecutionContextHost } from "@nestjs/core/helpers/execution-context-host";

export const CurrentUser = createParamDecorator((key: keyof JwtPayload, ctx: ExecutionContextHost): JwtPayload | Partial<JwtPayload> => {
    const request = ctx.switchToHttp().getRequest()
    return key ? request.user[key] : request.user
})