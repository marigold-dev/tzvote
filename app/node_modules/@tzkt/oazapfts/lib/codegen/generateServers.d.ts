import ts from "typescript";
import { OpenAPIV3 } from "openapi-types";
export declare function defaultBaseUrl(servers: OpenAPIV3.ServerObject[]): ts.StringLiteral;
export default function generateServers(servers: OpenAPIV3.ServerObject[]): ts.ObjectLiteralExpression;
