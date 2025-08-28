import AuthUsecase from "../usecases/auth.usecase.mjs";

class AuthController {
  constructor(authUseCase) {
    this.authUseCase = authUseCase;
  }

  register = async (req, res, next) => {
    try {
      const result = await this.authUseCase.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const result = await this.authUseCase.login(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
} 

export default AuthController;
