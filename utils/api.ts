import { NextApiRequest, NextApiResponse } from "next";

export interface Req<B> extends NextApiRequest {
	body: B;
}
export type Res<T> = NextApiResponse<T | ApiError>;
export type ApiHandler<T = any, V = any> = (req: Req<T>, res: Res<V>) => void;

export const wrongMethod: ApiHandler<any, any> = (req, res) => {
	res.status(405).json({
		message: "Method not Allowed",
		error: Error(`Method ${req.method} not allowed.`),
	});
};

export interface ApiError {
	message: string;
	error?: any;
}

export type ApiOut<P = any, E = any> =
	| { wasCorrect: true; payload: P }
	| { wasCorrect: false; payload: E };

export const isApiError = (tbd: any): tbd is ApiError => {
	try {
		return Boolean(tbd.message) || Boolean(tbd.error);
	} catch (error) {
		return false;
	}
};

/**
 * Maneja las peticiones y respuestas de una API. Este método debiera ser el punto de entrada de la API.
 * Recopila la información necesaria para el manejo de la petición.
 * @param req Datos del Request
 * @param res Datos del Response
 * @param wasSent Bandera que indica si ya se ha enviado algo al cliente, es de suma importancia
 * NO enviar este argumento.
 * @returns Un árbol de métodos para manejar la petición.
 */
export const ifRequest = <T, V>(req: Req<T>, res: Res<V>, wasSent = false) => {
	type MethodTypes = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";

	/**
	 * Determina si el tipo de método de la petición corresponde al esperado.
	 * @param method Método a comparar
	 * @returns Un árbol de métodos para manejar la petición.
	 */
	const is = (method: MethodTypes) => {
		/**
		 * Ejecuta una función si el método de la petición corresponde al anterior esperado.
		 * @param callback Función que se ejecutará si el método es el esperado.
		 * @returns Un árbol de métodos para manejar la petición.
		 */
		const respondWith = (callback: ApiHandler<T, V>) => {
			const methodIsCorrect = req.method === method;
			if (methodIsCorrect && !wasSent) {
				callback(req, res);
				wasSent = true;
			}
			return {
				/**
				 * Permite verificar otro tipo de método de la petición.
				 * @param method Método a comparar
				 * @returns
				 */
				elseIfIts: (method: MethodTypes) => {
					return ifRequest(req, res, wasSent).is(method);
				},
				/**
				 * Bienvenido al final. Si el método de la petición no corresponde a ninguno de los esperados,
				 * retornará un error `405: Method not allowed`.
				 */
				elseIsWrong: () => {
					!wasSent && wrongMethod(req, res);
				},
			};
		};

		return { respondWith };
	};

	return { is };
};

/**
 * Envía una respuesta al cliente. No olvides ocupar un `return` después de llamar esta función.
 * No vaya a ser que el servidor intente responder dos veces al request.
 * @param res Datos de la respuesta.
 * @param status Número de estado de la respuesta.
 * @param payload (Opcional) Contenido del payload de la respuesta. Si no es provisto, simplemente retornará el mensaje
 * del estado.
 */
export const sendResponse = <T>(
	res: Res<ApiOut<any>>,
	status: keyof typeof STATUS_MESSAGES,
	payload?: T
) => {
	const body: ApiOut<any> = {
		wasCorrect: status < 400,
		payload: payload ?? STATUS_MESSAGES[status],
	};
	res.status(status).json(body);
};

const STATUS_MESSAGES = {
	200: "OK",
	201: "Created",
	204: "No Content",
	400: "Bad request",
	401: "Unauthorized",
	402: "Payment required",
	403: "Forbidden",
	404: "Not found",
	405: "Method not allowed",
	406: "Not acceptable",
	407: "Proxy authentication required",
	408: "Request timeout",
	409: "Conflict",
	410: "Gone",
	411: "Length required",
	412: "Precondition failed",
	413: "Payload too large",
	414: "URI too long",
	415: "Unsupported media type",
	416: "Range not satisfiable",
	417: "Expectation failed",
	418: "I'm a teapot",
	421: "Misdirected request",
	422: "Unprocessable entity",
	423: "Locked",
	424: "Failed dependency",
	426: "Upgrade required",
	428: "Precondition required",
	429: "Too many requests",
	431: "Request header fields too large",
	451: "Unavailable for legal reasons",
	500: "Internal server error",
	501: "Not implemented",
	502: "Bad gateway",
	503: "Service unavailable",
	504: "Gateway timeout",
	505: "HTTP version not supported",
	506: "Variant also negotiates",
	507: "Insufficient storage",
	508: "Loop detected",
	510: "Not extended",
	511: "Network authentication required",
};

/**
 * Registra en un arreglo de parámetros, que todos tengan un valor distinto a `null` o  `undefined`.
 * @param params Arreglo de parámetros de la petición.
 * @returns Un mensaje de error con los parámetros faltantes, o `null` si no hay problemas.
 */
export const checkParameters = (params: { [key: string]: any }) => {
	let eList: string[] = [];
	let n = 0;

	Object.keys(params).forEach((key, i) => {
		if (params[key] === null || params[key] === undefined) {
			eList.push(` ${key},`);
			n++;
		}
	});

	if (n > 0)
		return `Falta${n > 1 ? "n" : ""} ${n} parámetro${n > 1 ? "s" : ""}: [${eList.join("")}]`;
	else return null;
};