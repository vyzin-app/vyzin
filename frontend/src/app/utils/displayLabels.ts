/**
 * Portuguese labels for UI display only. Domain types, API keys and code
 * identifiers stay in English.
 */
export const display = {
  reservation: {
    one: 'Reserva',
    many: 'Reservas',
    lower: 'reserva',
    lowerMany: 'reservas',
    new: 'Nova Reserva',
    edit: 'Editar Reserva',
    create: 'Criar Reserva',
    myMany: 'Minhas Reservas',
    totalMany: 'Reservas Totais',
    rules: 'Regras de Reserva',
    reserved: 'Reservado',
    guestOf: 'Convidado de Reserva',
    linkedVia: 'Vinculado via reserva',
    guestPurpose: 'Convidado de reserva',
    noneFound: 'Nenhuma reserva encontrada.',
    noneActive: 'Nenhuma reserva ativa disponível.',
    selectOptional: 'Selecionar reserva (opcional)',
    linkLabel: 'Vincular à Reserva',
    addVisitor: 'Adicionar Visitante à Reserva',
    guestRegisteredAs: 'O visitante será cadastrado como convidado desta reserva',
    noLinkedVisitors: 'Nenhum visitante vinculado a esta reserva.',
    cancelledNotice:
      'Esta reserva foi cancelada. Os vínculos de visitantes foram desfeitos, mas os registros dos visitantes permanecem no sistema.',
    confirmedMessage: 'Sua reserva foi confirmada',
    manageOwn: 'Gerencie suas reservas',
    manageAll: 'Gerencie as reservas dos espaços comuns',
    deleteConfirm:
      'Tem certeza que deseja excluir esta reserva? Os vínculos com visitantes serão removidos automaticamente, mas os registros dos visitantes serão preservados.',
    linkedCountHint:
      'O número de convidados é calculado automaticamente com base nos visitantes vinculados à reserva.',
    ruleAdvance48h: 'Reservas devem ser feitas com no mínimo 48h de antecedência',
    ruleUnlinkOnCancel:
      'Visitantes vinculados são removidos automaticamente ao cancelar a reserva',
    churrasqueiraRule: 'Reserva de churrasqueiras com 48h de antecedência',
    linkedToSelected: 'será vinculado à reserva selecionada.',
    deleteLinksWarning:
      'removido, mas quaisquer vínculos com reservas também serão desfeitos.',
    verMany: 'Ver Reservas',
  },
  dashboard: 'Painel',
} as const
