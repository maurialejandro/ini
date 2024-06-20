import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { auth } from "../../../configs/firebase-server";
import { User as UserCreds  } from "../../../models/User";

import { ifRequest, ApiHandler, ApiOut, sendResponse, checkParameters } from "../../../utils/api";
import { userIsAdmin } from "../../../utils/token";

const handler: ApiHandler = (req, res) => {
	ifRequest(req, res)
		.is("GET")
		.respondWith(GET.user)
		.elseIfIts("POST")
		.respondWith(POST.user)
		.elseIfIts("DELETE")
		.respondWith(DELETE.user)
		.elseIfIts("PUT")
		//.respondWith(PUT.user)
		//.elseIsWrong();
};

namespace GET {
	type In = { email: string };
	type Out = ApiOut<UserRecord, string>;

	export const user: ApiHandler<In, Out> = async (req, res) => {
		const { email } = req.query as In;
		const { token } = req.headers;
		let payload: UserRecord | string;
		let paramsMsg = checkParameters({ email, token });

		if (paramsMsg) {
			sendResponse(res, 400, paramsMsg);
			return;
		}

		try {
			if (!(await userIsAdmin(token as string))) {
				sendResponse(res, 400, "No tienes permiso para realizar esta acción");
				return;
			}
			payload = await auth.getUserByEmail(email);
			sendResponse(res, 200, payload);
			return;
		} catch (error: any) {
			sendResponse(res, 400, error.message);
			return;
		}
	};
}

namespace POST {
	type In = { email: string; password: string; permisos: "Administrador" | "Usuario" };
	type Out = ApiOut<UserRecord, string>;

	export const user: ApiHandler<In, Out> = async (req, res) => {
		const { email, password, permisos } = req.body as In;
		const { token } = req.headers;
		const paramsMsg = checkParameters({ email, password, permisos, token });
		let payload: UserRecord | undefined;

		if (paramsMsg) {
			sendResponse(res, 400, paramsMsg);
			return;
		}

		try {
			if (!(await userIsAdmin(token as string))) {
				sendResponse(res, 400, "No tienes permiso para realizar esta acción");
				return;
			}

			payload = await auth.createUser({ email, password });
			auth.setCustomUserClaims(payload.uid, { permisos });
			sendResponse(res, 200, payload);
			return;
		} catch (e: any) {
			sendResponse(res, 400, e.message);
			return;
		}
	};
}

namespace DELETE {
	type In = { userId: string };
	type Out = ApiOut<string, string>;

	export const user: ApiHandler<In, Out> = async (req, res) => {
		const { userId } = req.body;
		const { token } = req.headers;
		const paramsMsg = checkParameters({ userId, token });

		if (paramsMsg) {
			sendResponse(res, 400, paramsMsg);
			return;
		}
		
		try {
			if (!(await userIsAdmin(token as string))) {// se cae
				sendResponse(res, 400, "No tienes permiso para realizar esta acción.");
				return;
			}
			await auth.deleteUser(userId);
			sendResponse(res, 200, "Usuario eliminado.");
			return;
		} catch (e: any) {
			sendResponse(res, 400, e.message);
			return;
		}
	};
}

//namespace PUT {
//	type In = {
//		userId: string;
//		creds: UserCreds;
//	};
//
//	export const user: ApiHandler<In, any> = async (req, res) => {
//		const { userId, creds } = req.body;
//		const { token } = req.headers;
//
//		const paramsMsg = checkParameters({ userId, creds, token });
//
//		if (paramsMsg) {
//			sendResponse(res, 400, paramsMsg);
//			return;
//		}
//
//		try {
//			if (!(await userIsAdmin(token as string))) {
//				sendResponse(res, 400, "No tienes permiso para realizar esta acción");
//				return;
//			}
//
//			const { email, password, permisos } = creds;
//			const payload = await auth.updateUser(userId, { email, password });
//			await auth.setCustomUserClaims(userId, { permisos });
//			sendResponse(res, 200, payload);
//			return;
//		} catch (e: any) {
//			sendResponse(res, 400, e.message);
//			return;
//		}
//	};
//}

export default handler;