type SignInFormData = {
  email: string;
  password: string;
}

type UnsubscribeFunction = () => void

interface Window {
  electron: {
    getStaticData: () => void
    signInSubmit: (data: SignInFormData) => void
    signInResult: (callback: (path: string) => void) => void
  }
}

type EventPayloadMapping = {
  getStaticData: void
  signInSubmit: SignInFormData
  signInResult: string
}
