// Configuration and constants
export const CONFIG = {
  AUTH_STORAGE_KEY: 'cats-angular-clientuser:https://coretax.intranet.pajak.go.id/identityprovider:cats-angular-client',
  DEFAULT_CASES_FILTER: 'In Progress',
  REFUND_CASE_TYPE_NAME: 'Pengembalian Melalui Pelaporan Surat Pemberitahuan (SPT)',
  I18N_STORAGE_KEY: 'coretabs-language',
  SIDEBAR_STATE_KEY: 'coretabs-sidebar-state',
  SIDEBAR_DATA_KEY: 'coretabs-sidebar-data',
    
  API_ENDPOINTS: {
    CASES: 'https://coretax.intranet.pajak.go.id/casemanagement/api/caselist/mycases',
    DOCUMENTS: 'https://coretax.intranet.pajak.go.id/casemanagement/api/casedocument/list',
    USERS: 'https://coretax.intranet.pajak.go.id/casemanagement/api/caseuser/list',
    PROFILE: 'https://coretax.intranet.pajak.go.id/casemanagement/api/generalinformation/view',
    ROUTING: 'https://coretax.intranet.pajak.go.id/casemanagement/api/caserouting/view',
    DOWNLOAD: 'https://coretax.intranet.pajak.go.id/documentmanagement/api/download'
  }
};