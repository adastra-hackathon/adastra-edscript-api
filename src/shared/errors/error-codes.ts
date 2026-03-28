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

  // Game Rooms
  GAME_ROOM_NOT_FOUND: {
    code: 'GAME_ROOM_NOT_FOUND',
    message: 'Game room not found',
    translatedMessage: 'Sala não encontrada.',
    field: undefined as string | undefined,
    statusCode: 404,
  },
  GAME_ROOM_NOT_WAITING: {
    code: 'GAME_ROOM_NOT_WAITING',
    message: 'Game room is not waiting for players',
    translatedMessage: 'Esta sala não está aguardando jogadores.',
    field: undefined as string | undefined,
    statusCode: 409,
  },
  GAME_ROOM_FULL: {
    code: 'GAME_ROOM_FULL',
    message: 'Game room is full',
    translatedMessage: 'Esta sala já está cheia.',
    field: undefined as string | undefined,
    statusCode: 409,
  },
  GAME_ROOM_ALREADY_JOINED: {
    code: 'GAME_ROOM_ALREADY_JOINED',
    message: 'You already joined this room',
    translatedMessage: 'Você já entrou nesta sala.',
    field: undefined as string | undefined,
    statusCode: 409,
  },
  GAME_ROOM_NOT_IN_PROGRESS: {
    code: 'GAME_ROOM_NOT_IN_PROGRESS',
    message: 'Game room is not in progress',
    translatedMessage: 'Esta sala não está em andamento.',
    field: undefined as string | undefined,
    statusCode: 409,
  },
  GAME_ROOM_FORBIDDEN: {
    code: 'GAME_ROOM_FORBIDDEN',
    message: 'Only the host can perform this action',
    translatedMessage: 'Apenas o host pode executar esta ação.',
    field: undefined as string | undefined,
    statusCode: 403,
  },
  INSUFFICIENT_BALANCE: {
    code: 'INSUFFICIENT_BALANCE',
    message: 'Insufficient balance to join this room',
    translatedMessage: 'Saldo insuficiente para entrar nesta sala.',
    field: undefined as string | undefined,
    statusCode: 422,
  },

  // Prediction Rooms (Apostas)
  PREDICTION_ROOM_NOT_FOUND: {
    code: 'PREDICTION_ROOM_NOT_FOUND',
    message: 'Prediction room not found',
    translatedMessage: 'Sala de apostas não encontrada.',
    field: undefined as string | undefined,
    statusCode: 404,
  },
  PREDICTION_ROOM_NOT_WAITING: {
    code: 'PREDICTION_ROOM_NOT_WAITING',
    message: 'Prediction room is not waiting for players',
    translatedMessage: 'Esta sala não está aguardando jogadores.',
    field: undefined as string | undefined,
    statusCode: 409,
  },
  PREDICTION_ROOM_FULL: {
    code: 'PREDICTION_ROOM_FULL',
    message: 'Prediction room is full',
    translatedMessage: 'Esta sala já está cheia.',
    field: undefined as string | undefined,
    statusCode: 409,
  },
  PREDICTION_ROOM_ALREADY_JOINED: {
    code: 'PREDICTION_ROOM_ALREADY_JOINED',
    message: 'You already joined this prediction room',
    translatedMessage: 'Você já entrou nesta sala.',
    field: undefined as string | undefined,
    statusCode: 409,
  },
  PREDICTION_ROOM_NOT_IN_PROGRESS: {
    code: 'PREDICTION_ROOM_NOT_IN_PROGRESS',
    message: 'Prediction room is not in progress',
    translatedMessage: 'Esta sala não está em andamento.',
    field: undefined as string | undefined,
    statusCode: 409,
  },
  PREDICTION_ROOM_FORBIDDEN: {
    code: 'PREDICTION_ROOM_FORBIDDEN',
    message: 'Only the host can perform this action',
    translatedMessage: 'Apenas o host pode executar esta ação.',
    field: undefined as string | undefined,
    statusCode: 403,
  },
  PREDICTION_ROOM_NOT_ENOUGH_PLAYERS: {
    code: 'PREDICTION_ROOM_NOT_ENOUGH_PLAYERS',
    message: 'Not enough players to start the room',
    translatedMessage: 'São necessários pelo menos 2 jogadores para iniciar.',
    field: undefined as string | undefined,
    statusCode: 409,
  },
  PREDICTION_ROOM_NOT_JOINED: {
    code: 'PREDICTION_ROOM_NOT_JOINED',
    message: 'You are not a participant of this room',
    translatedMessage: 'Você não é participante desta sala.',
    field: undefined as string | undefined,
    statusCode: 403,
  },
  PREDICTION_DEADLINE_PASSED: {
    code: 'PREDICTION_DEADLINE_PASSED',
    message: 'The predictions deadline has passed',
    translatedMessage: 'O prazo para enviar palpites encerrou.',
    field: undefined as string | undefined,
    statusCode: 409,
  },
  PREDICTION_INVALID_EVENT: {
    code: 'PREDICTION_INVALID_EVENT',
    message: 'One or more events do not belong to this room',
    translatedMessage: 'Um ou mais eventos não pertencem a esta sala.',
    field: undefined as string | undefined,
    statusCode: 422,
  },
  PREDICTION_INVALID_OPTION: {
    code: 'PREDICTION_INVALID_OPTION',
    message: 'One or more options do not belong to the given event',
    translatedMessage: 'Uma ou mais opções não pertencem ao evento informado.',
    field: undefined as string | undefined,
    statusCode: 422,
  },
} as const;

export type ErrorCode = keyof typeof ErrorCodes;
