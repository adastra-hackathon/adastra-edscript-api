export const ErrorCodes = {
  // Auth — login
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    message: 'Invalid credentials',
    translatedMessage: 'E-mail, CPF ou senha inválidos.',
    field: undefined as string | undefined,
    statusCode: 401,
  },
  ACCOUNT_SUSPENDED: {
    code: 'ACCOUNT_SUSPENDED',
    message: 'Account suspended',
    translatedMessage: 'Sua conta foi suspensa. Entre em contato com o suporte.',
    field: undefined as string | undefined,
    statusCode: 403,
  },
  ACCOUNT_LOCKED: {
    code: 'ACCOUNT_LOCKED',
    message: 'Account temporarily locked',
    translatedMessage: 'Conta temporariamente bloqueada por excesso de tentativas. Tente novamente em 15 minutos.',
    field: undefined as string | undefined,
    statusCode: 423,
  },

  // Auth — register
  EMAIL_ALREADY_IN_USE: {
    code: 'EMAIL_ALREADY_IN_USE',
    message: 'Email already in use',
    translatedMessage: 'Este e-mail já está em uso.',
    field: 'email' as string | undefined,
    statusCode: 409,
  },
  CPF_ALREADY_IN_USE: {
    code: 'CPF_ALREADY_IN_USE',
    message: 'CPF already in use',
    translatedMessage: 'Este CPF já está cadastrado.',
    field: 'cpf' as string | undefined,
    statusCode: 409,
  },
  PHONE_ALREADY_IN_USE: {
    code: 'PHONE_ALREADY_IN_USE',
    message: 'Phone already in use',
    translatedMessage: 'Este número de celular já está cadastrado.',
    field: 'phone' as string | undefined,
    statusCode: 409,
  },

  // Token / session
  TOKEN_INVALID: {
    code: 'TOKEN_INVALID',
    message: 'Invalid or expired token',
    translatedMessage: 'Sessão inválida ou expirada. Faça login novamente.',
    field: undefined as string | undefined,
    statusCode: 401,
  },
  TOKEN_EXPIRED: {
    code: 'TOKEN_EXPIRED',
    message: 'Token expired',
    translatedMessage: 'Sessão expirada. Faça login novamente.',
    field: undefined as string | undefined,
    statusCode: 401,
  },
  SESSION_NOT_FOUND: {
    code: 'SESSION_NOT_FOUND',
    message: 'Session not found or revoked',
    translatedMessage: 'Sessão não encontrada ou revogada.',
    field: undefined as string | undefined,
    statusCode: 401,
  },

  // Profile
  WRONG_PASSWORD: {
    code: 'WRONG_PASSWORD',
    message: 'Current password is incorrect',
    translatedMessage: 'Senha atual incorreta.',
    field: 'currentPassword' as string | undefined,
    statusCode: 400,
  },
  FIELD_NOT_EDITABLE: {
    code: 'FIELD_NOT_EDITABLE',
    message: 'This field cannot be edited',
    translatedMessage: 'Este campo não pode ser alterado.',
    field: undefined as string | undefined,
    statusCode: 400,
  },
  PASSWORD_MISMATCH: {
    code: 'PASSWORD_MISMATCH',
    message: 'Passwords do not match',
    translatedMessage: 'As senhas não conferem.',
    field: 'confirmPassword' as string | undefined,
    statusCode: 400,
  },

  // Responsible Gaming
  RESPONSIBLE_GAMING_INVALID_LIMITS: {
    code: 'RESPONSIBLE_GAMING_INVALID_LIMITS',
    message: 'The provided limits are invalid',
    translatedMessage: 'Os limites informados são inválidos.',
    field: undefined as string | undefined,
    statusCode: 422,
  },
  RESPONSIBLE_GAMING_LIMIT_INCREASE_NOT_ALLOWED: {
    code: 'RESPONSIBLE_GAMING_LIMIT_INCREASE_NOT_ALLOWED',
    message: 'Cannot increase an active limit',
    translatedMessage: 'Não é permitido aumentar um limite ativo no momento.',
    field: undefined as string | undefined,
    statusCode: 422,
  },
  RESPONSIBLE_GAMING_SELF_EXCLUSION_ALREADY_ACTIVE: {
    code: 'RESPONSIBLE_GAMING_SELF_EXCLUSION_ALREADY_ACTIVE',
    message: 'A self-exclusion is already active',
    translatedMessage: 'Já existe uma auto exclusão ativa.',
    field: undefined as string | undefined,
    statusCode: 409,
  },
  RESPONSIBLE_GAMING_INVALID_EXCLUSION_DATE: {
    code: 'RESPONSIBLE_GAMING_INVALID_EXCLUSION_DATE',
    message: 'The exclusion date is invalid',
    translatedMessage: 'A data informada para exclusão é inválida.',
    field: 'untilDate' as string | undefined,
    statusCode: 422,
  },

  // User
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    message: 'User not found',
    translatedMessage: 'Usuário não encontrado.',
    field: undefined as string | undefined,
    statusCode: 404,
  },

  // Resource
  NOT_FOUND: {
    code: 'NOT_FOUND',
    message: 'Resource not found',
    translatedMessage: 'Recurso não encontrado.',
    field: undefined as string | undefined,
    statusCode: 404,
  },
  CONFLICT: {
    code: 'CONFLICT',
    message: 'Resource already exists',
    translatedMessage: 'Este recurso já existe.',
    field: undefined as string | undefined,
    statusCode: 409,
  },

  // Generic
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: 'Validation error',
    translatedMessage: 'Dados inválidos. Verifique os campos.',
    field: undefined as string | undefined,
    statusCode: 422,
  },
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
    translatedMessage: 'Erro interno. Tente novamente mais tarde.',
    field: undefined as string | undefined,
    statusCode: 500,
  },

  // Betslip
  BETSLIP_NOT_FOUND: {
    code: 'BETSLIP_NOT_FOUND',
    message: 'Betslip not found',
    translatedMessage: 'Bilhete não encontrado.',
    field: undefined as string | undefined,
    statusCode: 404,
  },
  BETSLIP_ALREADY_SUBMITTED: {
    code: 'BETSLIP_ALREADY_SUBMITTED',
    message: 'Betslip already submitted',
    translatedMessage: 'Este bilhete já foi enviado.',
    field: undefined as string | undefined,
    statusCode: 409,
  },
  BETSLIP_EMPTY: {
    code: 'BETSLIP_EMPTY',
    message: 'Betslip has no selections',
    translatedMessage: 'Adicione pelo menos uma seleção ao bilhete.',
    field: undefined as string | undefined,
    statusCode: 422,
  },
  SELECTION_NOT_FOUND: {
    code: 'SELECTION_NOT_FOUND',
    message: 'Selection not found',
    translatedMessage: 'Seleção não encontrada no bilhete.',
    field: undefined as string | undefined,
    statusCode: 404,
  },
} as const;

export type ErrorCode = keyof typeof ErrorCodes;
