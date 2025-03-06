import dotenv from "dotenv"

dotenv.config()

export const config = {
	backBlaze: {
		key: process.env.BACK_BLAZE_KEY as string,
		secret: process.env.BACK_BLAZE_SECRETa as string,
	},
	nodeEnv: process.env.NODE_ENV,
}
