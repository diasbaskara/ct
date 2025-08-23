// ==UserScript==
// @name         CoreTabs
// @namespace    https://git.diasbaskara.id/diasbaskara/userscripts/
// @version      0.3
// @description  Manage your cases easily.
// @author       Dias Baskara
// @match        https://coretax.intranet.pajak.go.id/*
// @grant        GM_addStyle
// @require      https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // --- SCRIPT CONFIGURATION ---
    const AUTH_STORAGE_KEY = 'cats-angular-clientuser:https://coretax.intranet.pajak.go.id/identityprovider:cats-angular-client';
    const DEFAULT_CASES_FILTER = 'In Progress';
    const REFUND_CASE_TYPE_NAME = 'Pengembalian Melalui Pelaporan Surat Pemberitahuan (SPT)';
    const I18N_STORAGE_KEY = 'coretabs-language';
    const SIDEBAR_STATE_KEY = 'coretabs-sidebar-state';
    const SIDEBAR_DATA_KEY = 'coretabs-sidebar-data';
    // ----------------------------

    // --- State Management ---
    let allMyCases = [], allCaseDocuments = [], allCaseUsers = [], refundReviewData = [];
    let filteredRefundData = [];
    let selectedCaseId = null;
    let loadedDocsForCaseId = null;
    let loadedUsersForCaseId = null;
    let loadedProfileForCaseId = null;
    let routingData = null;
    let workflowDiagram = null;
    let loadedRoutingForCaseId = null;
    let currentScreen = 'my-cases'; // 'my-cases' or 'case-details'

    // --- Date Formatting Function ---
    function formatDateCustom(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }

    // --- INTERNATIONALIZATION SYSTEM ---
    const translations = {
        en: {
            // Navigation & Screens
            'my_cases': 'My Cases',
            'case_details': 'Case Details',
            'back': '← Back',
            'no_case_selected': 'No Case Selected',
            'select_case_message': 'Please select a case from the "My Cases" screen',
            'select_case_tab_message': 'Please select a case from the "My Cases" tab',

            // Tabs
            'profile': 'Profile',
            'documents': 'Documents',
            'users': 'Users',
            'refund_review': 'Refund Review',
            'case_documents': 'Case Documents',
            'case_users': 'Case Users',

            // Buttons
            'open': 'Open',
            'docs': 'Docs',
            'download': 'Download',
            'downloading': 'Downloading...',
            'print': 'Print',
            'printing': 'Printing...',
            'print_failed': 'Print failed',
            'reload': 'Reload',
            'reload_page': 'Reload Page',
            'collapse_all': 'Collapse All',
            'expand_all': 'Expand All',
            'download_excel': 'Download Excel',
            'coretabs': 'CoreTabs',

            // Filters
            'filter_by_status': 'Filter by Status:',
            'filter_by_role': 'Filter by Role:',
            'filter_by_reported': 'Filter by Reported:',
            'show_all': 'Show All',
            'yes': 'Yes',
            'no': 'No',

            // Table Headers
            'case_number': 'Case Number',
            'taxpayer_name_tin': 'Taxpayer Name & TIN',
            'case_type': 'Case Type',
            'status': 'Status',
            'created_date': 'Created Date',
            'actions': 'Actions',
            'letter_number': 'Letter Number',
            'file_name': 'File Name',
            'date': 'Date',
            'full_name': 'Full Name',
            'nip': 'NIP',
            'position': 'Position',
            'office_name': 'Office Name',
            'doc_number': 'Doc Number',
            'selling_price': 'Selling Price',
            'vat_paid': 'VAT Paid',
            'stlg_paid': 'STLG Paid',
            'trans_code': 'Trans Code',
            'reported': 'Reported',
            'case_role': 'Case Role',

            // Status Values
            'in_progress': 'In Progress',
            'completed': 'Completed',
            'cancelled': 'Cancelled',
            'draft': 'Draft',
            'submitted': 'Submitted',
            'approved': 'Approved',
            'rejected': 'Rejected',
            'taxpayer': 'Taxpayer',
            'tax_officer': 'Tax Officer',
            'supervisor': 'Supervisor',
            'head_of_regional_office': 'Head of Regional Office',
            'head_of_division_of_audit,_collection,_intelligence,_and_investigation': 'Head of Division of Audit, Collection, Intelligence, and Investigation',
            'head_of_section_of_preliminary_investigation_&_investigation_administration': 'Head of Section of Preliminary Investigation & Investigation Administration',
            'digital_forensic_team_member': 'Digital Forensic Team Member',
            'digital_forensic_team_leader': 'Digital Forensic Team Leader',

            // Messages
            'loading': 'Loading...',
            'loading_my_cases': 'Loading my cases...',
            'loading_documents': 'Loading documents...',
            'loading_users': 'Loading users...',
            'loading_profile': 'Loading profile information...',
            'loading_routing': 'Loading routing information...',
            'loading_profile_name': 'Loading...',
            'loading_profile_email': 'Loading...',
            'no_cases_match': 'No cases match the selected filter.',
            'no_documents_found': 'No documents found or match the selected filter.',
            'no_users_found': 'No users found or match the selected filter.',
            'no_refund_data': 'No refund review data matches the filter.',
            'profile_not_available': 'Profile not available',
            'please_log_in': 'Please log in',
            'error_loading_profile': 'Error loading profile',
            'please_reload': 'Please reload',
            'download_failed': 'Download failed',
            'print_failed': 'Print failed',
            'routing': 'Routing',
            'case_must_be_selected': 'A case must be selected.',
            'select_case_for_documents': 'Please select a case to view its documents.',
            'select_case_for_users': 'Please select a case to view its users.',
            'select_case_for_profile': 'Please select a case to view its profile information.',
            'select_case_for_routing': 'Please select a case to view its routing information.',
            'select_refund_case': 'Select a refund case and click "Refund Review" in the header or row.',

            // Process Steps
            'step_1_3_fetching_subprocess': 'Step 1/3: Fetching Sub Process ID...',
            'step_2_3_fetching_reference': 'Step 2/3: Fetching reference number...',
            'step_3_3_fetching_refund': 'Step 3/3: Fetching refund details...',

            // Profile Fields
            'registration_date': 'Registration Date',
            'email_address': 'Email Address',
            'telephone_number': 'Telephone Number',
            'tax_region': 'Tax Region',
            'tax_office': 'Tax Office',
            'tax_office_address': 'Tax Office Address',
            'tax_office_phone': 'Tax Office Phone Number',
            'description': 'Description',
            'business_classification': 'Business Classification',
            'tax_period': 'Tax Period',
            'tax_year': 'Tax Year',
            'last_modified': 'Last Modified',
            'created_by': 'Created By',

            // Common Values
            'na': 'N/A',
            'error_occurred': 'An error occurred:',
            'language': 'Language'
        },
        id: {
            // Navigation & Screens
            'my_cases': 'Kasus Saya',
            'case_details': 'Detail Kasus',
            'back': '← Kembali',
            'no_case_selected': 'Tidak Ada Kasus Dipilih',
            'select_case_message': 'Silakan pilih kasus dari layar "Kasus Saya"',
            'select_case_tab_message': 'Silakan pilih kasus dari tab "Kasus Saya"',

            // Tabs
            'profile': 'Profil',
            'documents': 'Dokumen',
            'users': 'Pengguna',
            'refund_review': 'Tinjauan Restitusi',
            'case_documents': 'Dokumen Kasus',
            'case_users': 'Pengguna Kasus',
            'routing': 'Alur',

            // Buttons
            'open': 'Buka',
            'docs': 'Dokumen',
            'download': 'Unduh',
            'downloading': 'Mengunduh...',
            'print': 'Cetak',
            'printing': 'Mencetak...',
            'print_failed': 'Cetak gagal',
            'reload': 'Muat Ulang',
            'reload_page': 'Muat Ulang Halaman',
            'collapse_all': 'Tutup Semua',
            'expand_all': 'Bentangkan Semua',
            'download_excel': 'Unduh Excel',
            'coretabs': 'CoreTabs',

            // Filters
            'filter_by_status': 'Filter berdasarkan Status:',
            'filter_by_role': 'Filter berdasarkan Peran:',
            'filter_by_reported': 'Filter berdasarkan Dilaporkan:',
            'show_all': 'Tampilkan Semua',
            'cancelled': 'Dibatalkan',
            'completed': 'Selesai',
            'in_progress': 'Sedang Dikerjakan',
            'approved': 'DISETUJUI',
            'yes': 'Ya',
            'no': 'Tidak',

            // Table Headers
            'case_number': 'Nomor Kasus',
            'taxpayer_name_tin': 'Nama & NPWP Wajib Pajak',
            'taxpayer_name': 'Nama Wajib Pajak',
            'tin': 'NPWP',
            'case_type': 'Jenis Kasus',
            'status': 'Status',
            'created_date': 'Tanggal Dibuat',
            'actions': 'Aksi',
            'letter_number': 'Nomor Surat',
            'file_name': 'Nama File',
            'date': 'Tanggal',
            'full_name': 'Nama Lengkap',
            'nip': 'NIP',
            'position': 'Jabatan',
            'office_name': 'Nama Kantor',
            'doc_number': 'Nomor Dokumen',
            'selling_price': 'Harga Jual',
            'vat_paid': 'PPN Dibayar',
            'stlg_paid': 'PPnBM Dibayar',
            'trans_code': 'Kode Transaksi',
            'reported': 'Dilaporkan',
            'case_role': 'Peran Kasus',

            // Status Values
            'in_progress': 'Sedang Berlangsung',
            'completed': 'Selesai',
            'cancelled': 'Dibatalkan',
            'draft': 'Draf',
            'submitted': 'Diajukan',
            'approved': 'Disetujui',
            'rejected': 'Ditolak',
            'taxpayer': 'Wajib Pajak',
            'tax_officer': 'Petugas Pajak',
            'supervisor': 'Supervisor',
            'head_of_regional_office': 'Kepala Kanwil',
            'head_of_division_of_audit,_collection,_intelligence,_and_investigation': 'Kepala Bidang Pemeriksaan, Penagihan, Intelijen, dan Penyidikan',
            'head_of_section_of_preliminary_investigation_&_investigation_administration': 'Kepala Seksi Administrasi Bukti Permulaan dan Penyidikan',
            'digital_forensic_team_member': 'Anggota Tim Forensik Digital',
            'digital_forensic_team_leader': 'Ketua Tim Forensik Digital',

            // Messages
            'loading': 'Memuat...',
            'loading_my_cases': 'Memuat kasus saya...',
            'loading_documents': 'Memuat dokumen...',
            'loading_users': 'Memuat pengguna...',
            'loading_profile': 'Memuat informasi profil...',
            'loading_routing': 'Memuat informasi alur...',
            'loading_profile_name': 'Memuat...',
            'loading_profile_email': 'Memuat...',
            'no_cases_match': 'Tidak ada kasus yang sesuai dengan filter yang dipilih.',
            'no_documents_found': 'Tidak ada dokumen ditemukan atau sesuai dengan filter yang dipilih.',
            'no_users_found': 'Tidak ada pengguna ditemukan atau sesuai dengan filter yang dipilih.',
            'no_refund_data': 'Tidak ada data tinjauan restitusi yang sesuai dengan filter.',
            'profile_not_available': 'Profil tidak tersedia',
            'please_log_in': 'Silakan masuk',
            'error_loading_profile': 'Kesalahan memuat profil',
            'please_reload': 'Silakan muat ulang',
            'download_failed': 'Unduhan gagal',
            'print_failed': 'Pencetakan gagal',
            'routing': 'Alur',
            'case_must_be_selected': 'Kasus harus dipilih.',
            'select_case_for_documents': 'Silakan pilih kasus untuk melihat dokumennya.',
            'select_case_for_users': 'Silakan pilih kasus untuk melihat penggunanya.',
            'select_case_for_profile': 'Silakan pilih kasus untuk melihat informasi profilnya.',
            'select_case_for_routing': 'Silakan pilih kasus untuk melihat informasi alurnya.',
            'select_refund_case': 'Pilih kasus restitusi dan klik "Tinjauan Restitusi" di header atau baris.',

            // Process Steps
            'step_1_3_fetching_subprocess': 'Langkah 1/3: Mengambil ID Sub Proses...',
            'step_2_3_fetching_reference': 'Langkah 2/3: Mengambil nomor referensi...',
            'step_3_3_fetching_refund': 'Langkah 3/3: Mengambil detail restitusi...',

            // Profile Fields
            'registration_date': 'Tanggal Registrasi',
            'email_address': 'Alamat Email',
            'telephone_number': 'Nomor Telepon',
            'tax_region': 'Wilayah Pajak',
            'tax_office': 'Kantor Pajak',
            'tax_office_address': 'Alamat Kantor Pajak',
            'tax_office_phone': 'Nomor Telepon Kantor Pajak',
            'description': 'Deskripsi',
            'business_classification': 'Klasifikasi Usaha',
            'tax_period': 'Periode Pajak',
            'tax_year': 'Tahun Pajak',
            'last_modified': 'Terakhir Diubah',
            'created_by': 'Dibuat Oleh',

            // Common Values
            'na': 'T/A',
            'error_occurred': 'Terjadi kesalahan:',
            'language': 'Bahasa'
        }
    };

    // Language Management
    let currentLanguage = 'en';

    function detectLanguage() {
        // Check localStorage first
        const savedLang = localStorage.getItem(I18N_STORAGE_KEY);
        if (savedLang && translations[savedLang]) {
            return savedLang;
        }

        // Check browser language
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('id')) {
            return 'id';
        }

        // Default to English
        return 'en';
    }

    function setLanguage(lang) {
        if (!translations[lang]) {
            console.warn(`Language '${lang}' not supported. Falling back to English.`);
            lang = 'en';
        }

        currentLanguage = lang;
        localStorage.setItem(I18N_STORAGE_KEY, lang);

        // Update all UI elements
        updateUILanguage();
    }

    function t(key, fallback = null) {
        const translation = translations[currentLanguage]?.[key];
        if (translation) {
            return translation;
        }

        // Fallback to English if current language doesn't have the key
        const englishTranslation = translations.en[key];
        if (englishTranslation) {
            return englishTranslation;
        }

        // Return fallback or the key itself
        return fallback || key;
    }

    function translateStatus(status) {
        if (!status || status === 'N/A') return status;

        // Create translation key by converting to lowercase and replacing spaces with underscores
        const translationKey = status.toLowerCase().replace(/\s+/g, '_');
        return t(translationKey) || status; // Fallback to original if no translation exists
    }

    function updateUILanguage() {
        // Update navigation titles
        const navTitle = document.getElementById('ct-nav-title');
        if (navTitle) {
            if (currentScreen === 'my-cases') {
                navTitle.textContent = t('my_cases');
            } else if (currentScreen === 'case-details') {
                navTitle.textContent = t('case_details');
            }
        }

        // Update back button
        const backBtn = document.getElementById('ct-nav-back-btn');
        if (backBtn) {
            backBtn.textContent = t('back');
        }

        // Update header texts
        const headerTitle = document.getElementById('ct-header-title-text');
        const headerSubtitle = document.getElementById('ct-header-subtitle');
        if (headerTitle && (headerTitle.textContent === 'No Case Selected' || headerTitle.textContent === 'Tidak Ada Kasus Dipilih')) {
            headerTitle.textContent = t('no_case_selected');
        }
        if (headerSubtitle && (headerSubtitle.textContent.includes('My Cases') || headerSubtitle.textContent.includes('Kasus Saya'))) {
            headerSubtitle.textContent = t('select_case_message');
        }

        // Update tab buttons
        const tabButtons = document.querySelectorAll('.ct-tab-button');
        tabButtons.forEach(btn => {
            const tabName = btn.dataset.tab;
            switch (tabName) {
                case 'tab-profile':
                    btn.textContent = t('profile');
                    break;
                case 'tab-docs':
                    btn.textContent = t('documents');
                    break;
                case 'tab-users':
                    btn.textContent = t('users');
                    break;
                case 'tab-refund':
                    btn.textContent = t('refund_review');
                    break;
                case 'tab-routing':
                    btn.textContent = t('routing');
                    break;
            }
        });

        // Update filter labels
        updateFilterLabels();

        // Update button texts
        updateButtonTexts();

        // Update loading messages
        updateLoadingMessages();

        // Update profile loading text
        updateProfileLoadingText();

        // Re-populate filter dropdowns with translated options
        repopulateFilterDropdowns();

        // Re-render tables to update headers
        if (currentScreen === 'my-cases') {
            renderMyCasesTable();
        } else if (currentScreen === 'case-details') {
            if (loadedDocsForCaseId === selectedCaseId) {
                renderCaseDocumentsTable();
            }
            if (loadedUsersForCaseId === selectedCaseId) {
                renderCaseUsersTable();
            }
            if (refundReviewData.length > 0) {
                renderRefundReviewTable();
            }
        }
    }

    function updateLoadingMessages() {
        // Update all loading messages
        const loadingMessages = document.querySelectorAll('.ct-loading-message');
        loadingMessages.forEach(msg => {
            const text = msg.textContent;
            if (text.includes('Loading my cases') || text.includes('Memuat kasus saya')) {
                msg.textContent = t('loading_my_cases');
            } else if (text.includes('Please select a case to view its documents') || text.includes('Silakan pilih kasus untuk melihat dokumennya')) {
                msg.textContent = t('select_case_for_documents');
            } else if (text.includes('Please select a case to view its users') || text.includes('Silakan pilih kasus untuk melihat penggunanya')) {
                msg.textContent = t('select_case_for_users');
            } else if (text.includes('Please select a case to view its profile') || text.includes('Silakan pilih kasus untuk melihat profilnya')) {
                msg.textContent = t('select_case_for_profile');
            } else if (text.includes('Please select a case to view its routing') || text.includes('Silakan pilih kasus untuk melihat alurnya')) {
                msg.textContent = t('select_case_for_routing');
            } else if (text.includes('No cases match') || text.includes('Tidak ada kasus yang sesuai')) {
                msg.textContent = t('no_cases_match');
            } else if (text.includes('No documents found') || text.includes('Tidak ada dokumen ditemukan')) {
                msg.textContent = t('no_documents_found');
            } else if (text.includes('No users found') || text.includes('Tidak ada pengguna ditemukan')) {
                msg.textContent = t('no_users_found');
            } else if (text.includes('No refund review data') || text.includes('Tidak ada data tinjauan restitusi')) {
                msg.textContent = t('no_refund_data');
            }
        });
    }

    function updateProfileLoadingText() {
        // Update profile loading text
        const profileName = document.getElementById('ct-profile-name');
        const profileEmail = document.getElementById('ct-profile-email');

        if (profileName && (profileName.textContent === 'Loading...' || profileName.textContent === 'Memuat...')) {
            profileName.textContent = t('loading_profile_name');
        }
        if (profileEmail && (profileEmail.textContent === 'Loading...' || profileEmail.textContent === 'Memuat...')) {
            profileEmail.textContent = t('loading_profile_email');
        }
    }

    function repopulateFilterDropdowns() {
        // Save current filter values before repopulating
        const currentCasesFilter = document.getElementById("cases-status-filter")?.value || "In Progress";
        const currentDocsFilter = document.getElementById("docs-status-filter")?.value || "all";
        const currentUsersFilter = document.getElementById("users-role-filter")?.value || "all";
        const currentRefundFilter = document.getElementById("refund-reported-filter")?.value || "all";

        // Re-populate filter dropdowns with translated options
        populateFilter("cases-status-filter", [{ status: "In Progress" }, { status: "Completed" }, { status: "Cancelled" }], "status");
        populateFilter("docs-status-filter", [{ status: "Draft" }, { status: "Submitted" }, { status: "Approved" }, { status: "Rejected" }], "status");
        populateFilter("users-role-filter", [{ role: "Taxpayer" }, { role: "Tax Officer" }, { role: "Supervisor" }], "role");
        populateBooleanFilter("refund-reported-filter");

        // Restore the previous filter values
        const casesFilterElement = document.getElementById("cases-status-filter");
        const docsFilterElement = document.getElementById("docs-status-filter");
        const usersFilterElement = document.getElementById("users-role-filter");
        const refundFilterElement = document.getElementById("refund-reported-filter");

        if (casesFilterElement) casesFilterElement.value = currentCasesFilter;
        if (docsFilterElement) docsFilterElement.value = currentDocsFilter;
        if (usersFilterElement) usersFilterElement.value = currentUsersFilter;
        if (refundFilterElement) refundFilterElement.value = currentRefundFilter;
    }

    function updateFilterLabels() {
        // Update filter labels
        const filterLabels = {
            'cases-status-filter': t('filter_by_status'),
            'docs-status-filter': t('filter_by_status'),
            'users-role-filter': t('filter_by_role'),
            'refund-reported-filter': t('filter_by_reported')
        };

        Object.entries(filterLabels).forEach(([filterId, labelText]) => {
            const filter = document.getElementById(filterId);
            if (filter) {
                const label = filter.previousElementSibling;
                if (label && label.tagName === 'LABEL') {
                    label.textContent = labelText;
                }
            }
        });
    }

    function updateButtonTexts() {
        // Update toggle buttons while preserving their current state
        const toggleButtons = ['toggle-cases-btn', 'toggle-docs-btn', 'toggle-users-btn', 'toggle-refund-btn'];
        toggleButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                // Check if button is currently showing "expand" state
                const isExpanded = button.textContent === t('expand_all') ||
                    button.textContent === 'Expand All' ||
                    button.textContent === 'Bentangkan Semua' ||
                    button.textContent === 'Buka Semua';
                button.textContent = isExpanded ? t('expand_all') : t('collapse_all');
            }
        });

        // Update other buttons
        const buttonMappings = {
            'reload-profile-btn': t('reload'),
            'reload-docs-btn': t('reload'),
            'reload-users-btn': t('reload'),
            'reload-refund-btn': t('reload'),
            'reload-routing-btn': t('reload'),
            'refund-download-btn': t('download_excel'),
            'auth-reload-btn': t('reload_page')
        };

        Object.entries(buttonMappings).forEach(([buttonId, text]) => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.textContent = text;
            }
        });

        // Update CoreTabs toggle button
        const toggleButton = document.getElementById('ct-sidebar-toggle');
        if (toggleButton) {
            toggleButton.textContent = t('coretabs');
        }

        // Update dynamically created buttons by class name
        // Update all "Open" buttons in tables
        const openButtons = document.querySelectorAll('.action-btn.open-case');
        openButtons.forEach(button => {
            button.textContent = t('open');
        });

        // Update all "Refund Review" buttons in tables
        const refundButtons = document.querySelectorAll('.action-btn.review-refund-case');
        refundButtons.forEach(button => {
            button.textContent = t('refund_review');
        });
    }

    function createLanguageButtons() {
        const container = document.createElement('div');
        container.className = 'ct-language-buttons';

        const enBtn = document.createElement('button');
        enBtn.className = `ct-language-btn ${currentLanguage === 'en' ? 'active' : ''}`;
        enBtn.textContent = 'EN';
        enBtn.addEventListener('click', () => {
            setLanguage('en');
            updateLanguageButtons();
        });

        const idBtn = document.createElement('button');
        idBtn.className = `ct-language-btn ${currentLanguage === 'id' ? 'active' : ''}`;
        idBtn.textContent = 'ID';
        idBtn.addEventListener('click', () => {
            setLanguage('id');
            updateLanguageButtons();
        });

        container.appendChild(enBtn);
        container.appendChild(idBtn);

        return container;
    }

    function updateLanguageButtons() {
        const buttons = document.querySelectorAll('.ct-language-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if ((btn.textContent === 'EN' && currentLanguage === 'en') ||
                (btn.textContent === 'ID' && currentLanguage === 'id')) {
                btn.classList.add('active');
            }
        });
    }

    function createLanguageSwitcher() {
        return createLanguageButtons();
    }
    // ----------------------------

    // --- Navigation Functions ---
    function showScreen(screenName) {
        const screens = document.querySelectorAll('.ct-screen');
        screens.forEach(screen => screen.classList.remove('active'));

        const navTitle = document.getElementById('ct-nav-title');
        const navBackBtn = document.getElementById('ct-nav-back-btn');

        if (screenName === 'my-cases') {
            document.getElementById('ct-my-cases-screen').classList.add('active');
            currentScreen = 'my-cases';
            navTitle.textContent = t('my_cases');
            navBackBtn.style.display = 'none';
        } else if (screenName === 'case-details') {
            document.getElementById('ct-case-details-screen').classList.add('active');
            currentScreen = 'case-details';
            navTitle.textContent = t('case_details');
            navBackBtn.style.display = 'block';
        }
    }

    function navigateToCaseDetails(caseData) {
        selectedCaseId = caseData.AggregateIdentifier;

        // Update header with case information
        updateHeader(caseData);

        // Show/hide refund tab based on case type
        const refundTab = document.querySelector('[data-tab="tab-refund"]');
        if (caseData.CaseTypeName === REFUND_CASE_TYPE_NAME) {
            refundTab.style.display = 'block';
        } else {
            refundTab.style.display = 'none';
        }

        // Switch to case details screen
        showScreen('case-details');

        // Load profile tab by default
        switchTab('tab-profile');
    }

    function navigateBackToCases() {
        showScreen('my-cases');
        selectedCaseId = null;

        // Reset header
        document.getElementById('ct-header-title-text').textContent = t('no_case_selected');
        document.getElementById('ct-header-subtitle').textContent = t('select_case_message');
        document.getElementById('ct-header-initial').textContent = '';
        document.getElementById('ct-header-actions').innerHTML = '';
    }

    function addStyles() {
        GM_addStyle(`
            /* Import Inter font from Google Fonts */
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            /* === DESIGN SYSTEM FOUNDATIONS === */
            :root {
                /* Color Palette */
                --ct-white: #ffffff;
                --ct-primary-50: #f0f1f7;
                --ct-primary-100: #e1e3ef;
                --ct-primary-500: #212c5f;
                --ct-primary-600: #1c2551;
                --ct-primary-700: #171e43;
                --ct-primary-800: #121735;
                
                /* Secondary color palette (yellow accent) */
                --ct-secondary-50: #fefcf0;
                --ct-secondary-100: #fdf9e1;
                --ct-secondary-500: #f9cc30;
                --ct-secondary-600: #e6b82b;
                --ct-secondary-700: #d4a426;
                --ct-secondary-800: #c19021;
                
                --ct-gray-50: #f9fafb;
                --ct-gray-100: #f3f4f6;
                --ct-gray-200: #e5e7eb;
                --ct-gray-300: #d1d5db;
                --ct-gray-400: #9ca3af;
                --ct-gray-500: #6b7280;
                --ct-gray-600: #4b5563;
                --ct-gray-700: #374151;
                --ct-gray-800: #1f2937;
                --ct-gray-900: #111827;
                
                --ct-success-500: #10b981;
                --ct-success-600: #059669;
                --ct-warning-500: #f59e0b;
                --ct-warning-600: #d97706;
                --ct-error-500: #ef4444;
                --ct-error-600: #dc2626;
                --ct-danger-500: #ef4444;
                --ct-danger-600: #dc2626;
                --ct-info-500: #06b6d4;
                --ct-info-600: #0891b2;
                --ct-purple-500: #8b5cf6;
                --ct-purple-600: #7c3aed;
                
                /* Typography - Updated with Inter font */
                --ct-font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                --ct-font-size-2xs: 0.625rem;
                --ct-font-size-xs: 0.75rem;
                --ct-font-size-sm: 0.875rem;
                --ct-font-size-base: 1rem;
                --ct-font-size-lg: 1.125rem;
                --ct-font-size-xl: 1.25rem;
                --ct-font-size-2xl: 1.5rem;
                --ct-font-weight-normal: 400;
                --ct-font-weight-medium: 500;
                --ct-font-weight-semibold: 600;
                --ct-font-weight-bold: 700;
                
                /* Spacing */
                --ct-space-px: 1px;
                --ct-space-1: 0.25rem;
                --ct-space-2: 0.5rem;
                --ct-space-3: 0.75rem;
                --ct-space-4: 1rem;
                --ct-space-5: 1.25rem;
                --ct-space-6: 1.5rem;
                --ct-space-8: 2rem;
                --ct-space-12: 3rem;
                --ct-space-16: 4rem;
                --ct-space-20: 5rem;
                --ct-space-24: 6rem;
                --ct-space-10: 2.5rem;
                
                /* Border Radius */
                --ct-radius-none: 0;
            --ct-radius-sm: 0.25rem;
            --ct-radius-md: 0.375rem;
            --ct-radius-lg: 0.5rem;
            --ct-radius-xl: 0.75rem;
                
                /* Shadows */
                --ct-shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
                --ct-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                --ct-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                --ct-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                --ct-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                
                /* Transitions */
            --ct-transition-fast: 150ms ease-in-out;
            --ct-transition-normal: 250ms ease-in-out;
            --ct-transition-slow: 350ms ease-in-out;
            
            /* Layout */
            --ct-sidebar-width: 950px;
            --ct-sidebar-width-lg: 850px;
            --ct-sidebar-width-md: 700px;
            --ct-sidebar-width-sm: 100vw;
            --ct-sidebar-max-height: 800px;
            
            /* Z-Index */
            --ct-z-index-modal: 9999;
            
            /* Letter Spacing */
            --ct-letter-spacing-wide: 1px;
            }
            
            /* Apply Inter font globally to ensure consistent typography */
            * {
                font-family: var(--ct-font-family);
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
            
            /* Optimize text rendering for better readability */
            body, 
            #ct-sidebar,
            .ct-table,
            .ct-results-table {
                font-family: var(--ct-font-family);
                text-rendering: optimizeLegibility;
                font-feature-settings: 'kern' 1, 'liga' 1;
            }
            
            /* === SIDEBAR CONTAINER === */
            #ct-sidebar {
                position: fixed;
                top: 0;
                right: calc(-1 * var(--ct-sidebar-width));
                width: var(--ct-sidebar-width);
                height: 100vh;
                max-height: none;
                background-color: var(--ct-gray-50);
                border: none;
                border-radius: 0;
                box-shadow: var(--ct-shadow-xl);
                z-index: var(--ct-z-index-modal);
                transition: right var(--ct-transition-slow);
                display: flex;
                flex-direction: column;
                font-family: var(--ct-font-family);
            }
            #ct-sidebar.open { right: 0; }
            
            #ct-sidebar-toggle {
                position: fixed;
                top: 50%;
                right: 0;
                transform: translateY(-50%);
                width: var(--ct-space-10); /* Increased from --ct-space-8 for better spacing */
                height: var(--ct-space-24); /* Increased from --ct-space-20 for better proportions */
                background-color: var(--ct-primary-700);
                color: var(--ct-white);
                border: none;
                border-radius: var(--ct-radius-lg) 0 0 var(--ct-radius-lg);
                cursor: pointer;
                writing-mode: vertical-rl;
                text-orientation: mixed;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: calc(var(--ct-z-index-modal) + 1);
                font-size: var(--ct-font-size-sm);
                font-weight: var(--ct-font-weight-bold);
                letter-spacing: var(--ct-letter-spacing-wide);
                padding: var(--ct-space-3) var(--ct-space-2); /* Added proper padding */
                margin-right: var(--ct-space-1); /* Added margin for better spacing from edge */
                transition: all var(--ct-transition-fast); /* Enhanced transition for all properties */
                box-shadow: var(--ct-shadow-md); /* Added subtle shadow for depth */
            }
            
            #ct-sidebar-toggle:hover {
                background-color: var(--ct-primary-800);
                transform: translateY(-50%) translateX(-2px); /* Subtle hover animation */
                box-shadow: var(--ct-shadow-lg); /* Enhanced shadow on hover */
            }
            
            #ct-sidebar-toggle:focus {
                outline: 3px solid var(--ct-primary-300); /* Better contrast focus ring */
                outline-offset: 3px; /* Increased offset for better visibility */
                background-color: var(--ct-primary-600); /* Lighter background on focus */
                box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.3); /* Additional focus glow */
            }
            
            #ct-sidebar-toggle:focus:not(:focus-visible) {
                outline: none;
                box-shadow: var(--ct-shadow-md);
            }
            
            #ct-sidebar-toggle:active {
                transform: translateY(-50%) scale(0.95); /* Subtle press animation */
                background-color: var(--ct-primary-900);
            }
            
            /* Hide toggle button when sidebar is open */
            #ct-sidebar.open + #ct-sidebar-toggle {
                opacity: 0;
                visibility: hidden;
                transform: translateY(-50%) translateX(100%);
                pointer-events: none;
            }
            
            /* === PROFILE SECTION === */
            #ct-profile-section {
                padding: var(--ct-space-4);
                background-color: var(--ct-primary-600);
                color: var(--ct-white);
                border-bottom: 1px solid var(--ct-primary-700);
                flex-shrink: 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: var(--ct-space-3);
            }
            
            /* New container for profile info and language buttons */
            #ct-profile-right {
                display: flex;
                align-items: center;
                gap: var(--ct-space-3);
            }
            
            #ct-navigation-area {
                display: flex;
                align-items: center;
                gap: var(--ct-space-3);
            }
            
            #ct-nav-back-btn {
                background: none;
                border: 1px solid var(--ct-white);
                color: var(--ct-white);
                padding: var(--ct-space-2) var(--ct-space-3);
                border-radius: var(--ct-radius-md);
                cursor: pointer;
                font-size: var(--ct-font-size-sm);
                font-weight: var(--ct-font-weight-medium);
                transition: all var(--ct-transition-fast);
                display: none;
            }
            
            #ct-nav-back-btn:hover {
                background-color: rgba(255, 255, 255, 0.1);
                transform: translateY(-1px);
            }
            
            #ct-nav-title {
                font-size: var(--ct-font-size-lg);
                font-weight: var(--ct-font-weight-bold);
            }
            
            #ct-profile-info {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: var(--ct-space-1);
                text-align: right;
            }
            
            #ct-profile-name {
                font-size: var(--ct-font-size-base);
                font-weight: var(--ct-font-weight-bold);
                color: var(--ct-white);
            }
            
            #ct-profile-email {
                font-size: var(--ct-font-size-xs);
                color: var(--ct-gray-300);
                font-weight: var(--ct-font-weight-normal);
            }
            
            /* Language switcher buttons */
            .ct-language-buttons {
                display: flex;
                gap: var(--ct-space-1);
            }
            
            .ct-language-btn {
                padding: var(--ct-space-2) var(--ct-space-3);
                background: transparent;
                border: 1px solid var(--ct-white);
                color: var(--ct-white);
                border-radius: var(--ct-radius-sm);
                cursor: pointer;
                font-size: var(--ct-font-size-sm);
                font-weight: var(--ct-font-weight-medium);
                transition: all var(--ct-transition-fast);
                min-width: 40px;
                text-align: center;
            }
            
            .ct-language-btn:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }
            
            .ct-language-btn.active {
                background-color: var(--ct-white);
                color: var(--ct-gray-800);
            }
            
            /* === SCREEN LAYOUT === */
            .ct-screen {
                display: none;
                flex: 1;
                flex-direction: column;
                height: 100%;
            }
            .ct-screen.active { display: flex; }
            #ct-my-cases-screen { 
                background-color: var(--ct-gray-50);
                padding: 0;
            }
            #ct-case-details-screen { background-color: var(--ct-white); }
            
            #tab-my-cases {
                display: flex;
                flex-direction: column;
                flex: 1;
                overflow-y: auto;
                height: 100%;
                max-height: calc(100vh - 100px); /* Match other tabs */
                padding: var(--ct-space-4);
            }
            
            /* === HEADERS === */
            .ct-screen-header {
                padding: var(--ct-space-4);
                background-color: var(--ct-gray-800);
                color: var(--ct-white);
                font-size: var(--ct-font-size-lg);
                font-weight: var(--ct-font-weight-bold);
                display: flex;
                align-items: center;
                gap: var(--ct-space-3);
                flex-shrink: 0;
            }
            
            #ct-header-area {
                padding: var(--ct-space-4);
                background-color: var(--ct-gray-100);
                color: var(--ct-gray-800);
                flex-shrink: 0;
                display: flex;
                align-items: center;
                gap: var(--ct-space-4);
                border-bottom: 1px solid var(--ct-gray-200);
            }
            
            #ct-header-icon { flex-shrink: 0; }
            #ct-header-icon svg {
                width: 32px;
                height: 32px;
                fill: var(--ct-gray-500);
            }
            
            #ct-header-text {
                flex-grow: 1;
                min-width: 0;
            }
            
            #ct-header-title {
                display: flex;
                align-items: center;
                gap: var(--ct-space-2);
                font-size: var(--ct-font-size-base);
                font-weight: var(--ct-font-weight-semibold);
            }
            
            #ct-header-title-text {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            #ct-header-initial {
                display: inline-block;
                padding: var(--ct-space-1) var(--ct-space-2);
                font-size: var(--ct-font-size-xs);
                font-weight: var(--ct-font-weight-bold);
                border-radius: var(--ct-radius-lg);
                background-color: var(--ct-gray-600);
                color: var(--ct-gray-100);
                line-height: 1;
                flex-shrink: 0;
            }
            #ct-header-initial:empty { display: none; }
            
            #ct-header-subtitle {
                font-size: var(--ct-font-size-sm);
                color: var(--ct-gray-500);
                margin-top: var(--ct-space-1);
            }
            
            #ct-header-actions {
                margin-left: auto;
                flex-shrink: 0;
                display: flex;
                gap: var(--ct-space-2);
            }
            
            /* === TABS === */
            #ct-tab-bar {
                display: flex;
                background-color: var(--ct-gray-100);
                border-bottom: 1px solid var(--ct-gray-200);
                flex-shrink: 0;
                align-items: stretch; /* Ensure all buttons have same height */
            }
            
            .ct-tab-button {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: var(--ct-space-3) var(--ct-space-4);
                border: none;
                background-color: transparent;
                cursor: pointer;
                font-size: var(--ct-font-size-sm);
                font-weight: var(--ct-font-weight-medium);
                color: var(--ct-gray-600);
                border-bottom: 3px solid transparent;
                transition: all var(--ct-transition-fast);
                min-height: 48px; /* Ensure consistent minimum height */
                box-sizing: border-box;
                white-space: nowrap;
                line-height: 1.2;
            }
            
            .ct-tab-button:hover {
                background-color: var(--ct-gray-200);
                color: var(--ct-gray-800);
            }
            
            .ct-tab-button.active {
                border-bottom: 3px solid var(--ct-primary-600);
                font-weight: var(--ct-font-weight-semibold);
                background-color: var(--ct-white);
                color: var(--ct-primary-700);
            }
            
            #ct-tab-content-area {
                padding: var(--ct-space-4);
                flex-grow: 1;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
            }
            
            .ct-tab-panel {
                display: none;
                flex-grow: 1;
                overflow-y: auto;
                flex-direction: column;
                height: 100%; /* Ensure full height usage */
                max-height: calc(100vh - 250px); /* Prevent overflow beyond sidebar */
                padding: 0; /* Remove any inconsistent padding */
            }
            .ct-tab-panel.active { 
                display: flex; 
            }
            
            /* === FILTERS === */
            .filter-container {
                margin-bottom: 0; /* Remove bottom margin to prevent double spacing */
                flex-shrink: 0;
                display: flex;
                gap: var(--ct-space-4);
                align-items: center;
                padding: var(--ct-space-3);
                background-color: var(--ct-white);
                border: 1px solid var(--ct-gray-200);
                border-radius: var(--ct-radius-lg);
                box-shadow: var(--ct-shadow-sm);
                min-height: 60px; /* Ensure consistent filter height */
            }
            
            .filter-container > div:first-child {
                margin-right: auto;
            }
            
            .filter-container label {
                font-weight: var(--ct-font-weight-medium);
                color: var(--ct-gray-700);
                margin-right: var(--ct-space-2);
                font-size: var(--ct-font-size-sm);
            }
            
            .filter-container select {
                /* Hide default select styling */
                appearance: none;
                -webkit-appearance: none;
                -moz-appearance: none;
                padding: var(--ct-space-2) var(--ct-space-3);
                padding-right: 0; /* Remove right padding to make room for custom arrow */
                border-radius: var(--ct-radius-md);
                border: 1px solid var(--ct-gray-300);
                font-size: var(--ct-font-size-sm);
                background-color: var(--ct-white);
                transition: border-color var(--ct-transition-fast);
                cursor: pointer;
                display: flex;
                align-items: center;
                min-width: 120px;
                position: relative;
            }
            
            /* Custom dropdown wrapper */
            .ct-select-wrapper {
                position: relative;
                display: inline-flex;
                align-items: center;
                border: 1px solid var(--ct-gray-300);
                border-radius: var(--ct-radius-md);
                background-color: var(--ct-white);
                transition: border-color var(--ct-transition-fast);
                overflow: hidden;
                min-width: 120px;
            }
            
            .ct-select-wrapper:hover {
                border-color: var(--ct-gray-400);
            }
            
            .ct-select-wrapper:focus-within {
                border-color: var(--ct-primary-500);
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .ct-select-wrapper select {
                flex: 1;
                padding: var(--ct-space-2) var(--ct-space-3);
                border: none;
                background: transparent;
                font-size: var(--ct-font-size-sm);
                color: var(--ct-gray-700);
                cursor: pointer;
                appearance: none;
                -webkit-appearance: none;
                -moz-appearance: none;
                outline: none;
            }
            
            /* Custom arrow button area */
            .ct-select-arrow {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 100%;
                background-color: var(--ct-gray-50);
                border-left: 1px solid var(--ct-gray-200);
                cursor: pointer;
                transition: background-color var(--ct-transition-fast);
                pointer-events: none; /* Allow clicks to pass through to select */
            }
            
            .ct-select-wrapper:hover .ct-select-arrow {
                background-color: var(--ct-gray-100);
            }
            
            .ct-select-arrow::after {
                content: '▼';
                font-size: 10px;
                color: var(--ct-gray-600);
                transform: translateY(-1px);
            }
            
            /* Legacy select styling for backwards compatibility */
            .filter-container select:not(.ct-select-wrapper select) {
                padding: var(--ct-space-2) var(--ct-space-3);
                border-radius: var(--ct-radius-md);
                border: 1px solid var(--ct-gray-300);
                font-size: var(--ct-font-size-sm);
                background-color: var(--ct-white);
                transition: border-color var(--ct-transition-fast);
            }
            
            .filter-container select:focus {
                outline: none;
                border-color: var(--ct-primary-500);
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            /* === TABLE COMPONENT SYSTEM === */
            /* Base Table Styles */
            .ct-table {
                width: 100%;
                border-collapse: collapse;
                font-size: var(--ct-font-size-sm);
                background-color: var(--ct-white);
                border-radius: 0;
                overflow: hidden;
                box-shadow: none;
                box-sizing: border-box;
                border-spacing: 0; /* Remove any spacing between cells */
            }
            
            .ct-table td,
            .ct-table th {
                padding: var(--ct-space-3);
                text-align: left;
                vertical-align: middle;
                border: none;
                box-sizing: border-box;
                margin: 0; /* Remove any margins */
            }
            
            .ct-table th {
                background: var(--ct-gray-100) !important;
                background-image: none !important;
                font-weight: var(--ct-font-weight-semibold);
                color: var(--ct-gray-700);
                font-size: var(--ct-font-size-xs);
                text-transform: uppercase;
                letter-spacing: var(--ct-space-px);
                position: sticky;
                top: 0;
                z-index: 10;
                border: none !important;
                margin: 0;
                padding: var(--ct-space-3);
                line-height: 1.2;
                border-bottom: 1px solid var(--ct-gray-300) !important;
                border-spacing: 0;
            }
            
            /* Remove gaps between headers completely */
            .ct-table thead {
                border-collapse: collapse;
                border-spacing: 0;
            }
            
            .ct-table thead tr {
                border-collapse: collapse;
                border-spacing: 0;
                margin: 0;
                padding: 0;
            }
            
            .ct-table thead tr th {
                border-left: none !important;
                border-right: none !important;
                border-top: none !important;
                margin: 0 !important;
                padding-left: var(--ct-space-3);
                padding-right: var(--ct-space-3);
            }
            
            /* Add only bottom borders to table cells for row separation */
            .ct-table td {
                border-bottom: 1px solid var(--ct-gray-200);
            }
            
            .ct-table tbody tr:last-child td {
                border-bottom: none;
            }
            
            .ct-table tbody tr {
                transition: background-color var(--ct-transition-fast);
            }
            
            .ct-table tbody tr:hover {
                background-color: var(--ct-gray-50);
            }
            
            .ct-table tbody tr:last-child td {
                border-bottom: none;
            }
            
            /* Table Size Variants */
            .ct-table--xs {
                font-size: var(--ct-font-size-xs);
            }
            
            .ct-table--xs td,
            .ct-table--xs th {
                padding: var(--ct-space-2);
            }
            
            .ct-table--sm {
                font-size: var(--ct-font-size-sm);
            }
            
            .ct-table--sm td,
            .ct-table--sm th {
                padding: var(--ct-space-2) var(--ct-space-3);
            }
            
            .ct-table--lg {
                font-size: var(--ct-font-size-base);
            }
            
            .ct-table--lg td,
            .ct-table--lg th {
                padding: var(--ct-space-4);
            }
            
            /* Table Style Variants */
            .ct-table--bordered {
                border: 1px solid var(--ct-gray-200);
            }
            
            .ct-table--bordered td,
            .ct-table--bordered th {
                border: 1px solid var(--ct-gray-200);
            }
            
            .ct-table--striped tbody tr:nth-child(even) {
                background-color: var(--ct-gray-50);
            }
            
            .ct-table--striped tbody tr:nth-child(even):hover {
                background-color: var(--ct-gray-100);
            }
            
            .ct-table--minimal {
                box-shadow: none;
                border-radius: 0;
            }
            
            .ct-table--minimal td,
            .ct-table--minimal th {
                border-left: none;
                border-right: none;
            }
            
            .ct-table--minimal th {
                background-color: transparent;
                border-bottom: 2px solid var(--ct-gray-200);
            }
            
            /* Interactive Table Features */
            .ct-table--clickable tbody tr {
                cursor: pointer;
            }
            
            .ct-table--clickable tbody tr:hover {
                background-color: var(--ct-primary-50);
            }
            
            .ct-table tr.selected {
                background-color: var(--ct-primary-50) !important;
                border-left: 3px solid var(--ct-primary-500);
            }
            
            .ct-table tr.selected td:first-child {
                border-left: none;
            }
            
            /* Group Headers */
            .ct-table .group-header td {
                background-color: var(--ct-primary-700);
                color: var(--ct-white);
                font-weight: var(--ct-font-weight-semibold);
                padding: var(--ct-space-2) var(--ct-space-3);
                border-bottom: 1px solid var(--ct-primary-800);
            }
            
            .ct-table .group-header .group-title {
                font-weight: var(--ct-font-weight-semibold);
                font-size: var(--ct-font-size-sm);
                color: var(--ct-white);
            }
            
            .ct-table .group-header .group-subtitle {
                font-size: var(--ct-font-size-xs);
                color: var(--ct-gray-300);
                margin-top: var(--ct-space-1);
                font-weight: var(--ct-font-weight-normal);
            }
            
            /* Table Cell Utilities */
            .ct-table .cell-center {
                text-align: center;
            }
            
            .ct-table .cell-right {
                text-align: right;
            }
            
            .ct-table .cell-nowrap {
                white-space: nowrap;
            }
            
            .ct-table .cell-numeric {
                font-variant-numeric: tabular-nums;
                font-weight: var(--ct-font-weight-medium);
                font-family: 'JetBrains Mono', 'Fira Code', 'Source Code Pro', 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
                text-align: right;
            }
            
            .ct-table .cell-actions {
                text-align: left;
                white-space: nowrap;
            }
            
            /* Data Display Components */
            .ct-data-card {
                background-color: var(--ct-white);
                border: 1px solid var(--ct-gray-200);
                border-radius: var(--ct-radius-lg);
                padding: var(--ct-space-4);
                box-shadow: var(--ct-shadow-sm);
            }
            
            .ct-data-card--compact {
                padding: var(--ct-space-3);
            }
            
            .ct-data-card--spacious {
                padding: var(--ct-space-6);
            }
            
            .ct-data-list {
                background-color: var(--ct-white);
                border: 1px solid var(--ct-gray-200);
                border-radius: var(--ct-radius-lg);
                overflow: hidden;
            }
            
            .ct-data-list-item {
                padding: var(--ct-space-3) var(--ct-space-4);
                border-bottom: 1px solid var(--ct-gray-200);
                transition: background-color var(--ct-transition-fast);
            }
            
            .ct-data-list-item:last-child {
                border-bottom: none;
            }
            
            .ct-data-list-item:hover {
                background-color: var(--ct-gray-50);
            }
            
            .ct-data-list-item--clickable {
                cursor: pointer;
            }
            
            .ct-data-list-item--clickable:hover {
                background-color: var(--ct-primary-50);
            }
            
            .ct-stat-card {
                background-color: var(--ct-white);
                border: 1px solid var(--ct-gray-200);
                border-radius: var(--ct-radius-lg);
                padding: var(--ct-space-4);
                text-align: center;
                box-shadow: var(--ct-shadow-sm);
            }
            
            .ct-stat-value {
            font-size: var(--ct-font-size-xl);
            font-weight: var(--ct-font-weight-bold);
            color: var(--ct-gray-900);
            margin-bottom: var(--ct-space-1);
        }
            
            .ct-stat-label {
                font-size: var(--ct-font-size-sm);
                color: var(--ct-gray-500);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            .ct-stat-change {
                font-size: var(--ct-font-size-sm);
                font-weight: var(--ct-font-weight-medium);
                margin-top: var(--ct-space-2);
            }
            
            .ct-stat-change--positive {
                color: var(--ct-success-500);
            }
            
            .ct-stat-change--negative {
                color: var(--ct-error-500);
            }
            
            .ct-stat-change--neutral {
                color: var(--ct-gray-500);
            }
            
            /* Loading States */
            .ct-table--loading {
                position: relative;
                overflow: hidden;
            }
            
            .ct-table--loading::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(
                    90deg,
                    transparent,
                    rgba(255, 255, 255, 0.4),
                    transparent
                );
                animation: ct-shimmer 1.5s infinite;
            }
            
            @keyframes ct-shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            
            .ct-skeleton {
                background: linear-gradient(
                    90deg,
                    var(--ct-gray-200) 25%,
                    var(--ct-gray-100) 50%,
                    var(--ct-gray-200) 75%
                );
                background-size: 200% 100%;
                animation: ct-shimmer 1.5s infinite;
                border-radius: var(--ct-radius-sm);
            }
            
            .ct-skeleton--text {
                height: 1em;
                margin: 0.25em 0;
            }
            
            .ct-skeleton--title {
                height: 1.5em;
                margin: 0.5em 0;
            }
            
            .ct-skeleton--button {
                height: 2.5em;
                width: 6em;
            }
            
            /* === LEGACY TABLE STYLES === */
            .results-container {
                flex-grow: 1;
                overflow-y: auto;
                overflow-x: auto;
                padding: 0; /* Remove padding to allow table to fill container */
                margin: var(--ct-space-3) 0; /* Keep top margin for proper spacing */
                border: var(--ct-space-px) solid var(--ct-gray-200);
                border-radius: var(--ct-radius-lg);
                background-color: var(--ct-white);
                box-shadow: var(--ct-shadow-sm);
                height: calc(100% - 120px);
                min-height: var(--ct-space-20);
                position: relative;
            }
            
            .ct-results-table {
                width: 100%;
                border-collapse: collapse;
                font-size: var(--ct-font-size-sm);
                table-layout: auto; /* Allow flexible column sizing */
                word-wrap: break-word; /* Enable word wrapping */
                box-sizing: border-box;
                border-spacing: 0; /* Remove any spacing between cells */
            }
            
            .ct-results-table td,
            .ct-results-table th {
                padding: var(--ct-space-3);
                text-align: left;
                vertical-align: middle;
                box-sizing: border-box;
                border: none;
                margin: 0; /* Remove any margins */
            }
            
            .ct-results-table th {
                background: var(--ct-gray-100) !important;
                background-image: none !important;
                font-weight: var(--ct-font-weight-semibold);
                color: var(--ct-gray-700);
                position: sticky;
                top: 0;
                z-index: 10;
                font-size: var(--ct-font-size-xs);
                text-transform: uppercase;
                letter-spacing: var(--ct-space-px);
                border: none !important;
                margin: 0;
                line-height: 1.2;
                border-bottom: 1px solid var(--ct-gray-300) !important;
                border-spacing: 0;
            }
            
            /* Remove gaps between headers completely */
            .ct-results-table thead {
                border-collapse: collapse;
                border-spacing: 0;
            }
            
            .ct-results-table thead tr {
                border-collapse: collapse;
                border-spacing: 0;
                margin: 0;
                padding: 0;
            }
            
            .ct-results-table thead tr th {
                border-left: none !important;
                border-right: none !important;
                border-top: none !important;
                margin: 0 !important;
                padding-left: var(--ct-space-3);
                padding-right: var(--ct-space-3);
            }
            
            /* Add only bottom borders to table cells for row separation */
            .ct-results-table td {
                border-bottom: 1px solid var(--ct-gray-200);
            }
            
            .ct-results-table tbody tr:last-child td {
                border-bottom: none;
            }
            
            .ct-results-table tbody tr:not(.group-header) {
                cursor: pointer;
                transition: background-color var(--ct-transition-fast);
            }
            
            .ct-results-table tbody tr:not(.group-header):hover {
                background-color: var(--ct-gray-50);
            }
            
            .ct-results-table tr.selected {
                background-color: var(--ct-primary-50) !important;
                border-left: 3px solid var(--ct-primary-500);
            }
            
            .group-header td {
                background-color: var(--ct-primary-700);
                color: var(--ct-white);
                font-weight: var(--ct-font-weight-semibold);
                padding: var(--ct-space-2) var(--ct-space-3);
            }
            
            .group-header .group-title {
                font-weight: var(--ct-font-weight-semibold);
                font-size: var(--ct-font-size-sm);
                color: var(--ct-white);
            }
            
            .group-header .group-subtitle {
                font-size: var(--ct-font-size-xs);
                color: var(--ct-gray-300);
                margin-top: var(--ct-space-1);
                font-weight: var(--ct-font-weight-normal);
            }
            
            .toggle-icon {
                display: inline-block;
                width: 1em;
                margin-right: var(--ct-space-2);
                transition: transform var(--ct-transition-fast);
            }
            
            .group-header.expanded .toggle-icon::before { content: '▾'; }
            .group-header.collapsed .toggle-icon::before { content: '▸'; }
            
            .subtitle-tin {
                font-size: var(--ct-font-size-xs);
                color: var(--ct-gray-500);
                margin-top: var(--ct-space-1);
                font-family: 'JetBrains Mono', 'Fira Code', 'Source Code Pro', 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
                font-variant-numeric: tabular-nums;
            }
            
            .currency-wrapper {
                display: flex;
                justify-content: space-between;
            }
            
            .currency-num {
                font-variant-numeric: tabular-nums;
                font-weight: var(--ct-font-weight-medium);
                font-family: 'JetBrains Mono', 'Fira Code', 'Source Code Pro', 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            }
            
            // Add new class for general numeric values
            .ct-numeric {
                font-family: 'JetBrains Mono', 'Fira Code', 'Source Code Pro', 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
                font-variant-numeric: tabular-nums;
            }
            
            .reported-cell {
                text-align: center !important;
                font-size: var(--ct-font-size-base);
            }
            
            .actions-cell {
                text-align: left !important;
                white-space: nowrap;
                min-width: 180px; /* Reduced min-width */
                max-width: 220px; /* Reduced max-width */
                padding: var(--ct-space-2) var(--ct-space-3) !important;
                vertical-align: top; /* Changed to top for better multi-line alignment */
                line-height: 1.4; /* Better line spacing for wrapped content */
            }
            
            .actions-cell .ct-btn {
                margin-right: 8px;
                vertical-align: middle;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-height: 28px;
                box-sizing: border-box;
            }
            
            .actions-cell .ct-btn:last-child {
                margin-right: 0;
            }
            
            .actions-cell .ct-btn-group {
                display: inline-flex;
                align-items: center;
                margin-right: 8px;
                vertical-align: middle;
            }
            
            .actions-cell .ct-btn-group:last-child {
                margin-right: 0;
            }
            
            .actions-cell .ct-btn-group .ct-btn {
                margin: 0; /* No margins within button groups */
            }
            
            /* Ensure all buttons in actions cell have consistent styling */
            .actions-cell .ct-btn,
            .actions-cell .ct-btn-group .ct-btn {
                font-size: var(--ct-font-size-xs);
                padding: var(--ct-space-1) var(--ct-space-2);
                line-height: 1.2;
                white-space: nowrap;
                min-height: 28px; /* Consistent height for xs buttons */
                box-sizing: border-box;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            
            .print-doc {
                background-color: var(--ct-primary-500) !important;
                color: var(--ct-white) !important;
                border-color: var(--ct-primary-500) !important;
            }
            
            .print-doc:hover {
                background-color: var(--ct-primary-600) !important;
                border-color: var(--ct-primary-600) !important;
            }
            
            /* === ACTION BUTTONS === */
            .action-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: var(--ct-space-1);
                padding: var(--ct-space-2) var(--ct-space-3);
                margin: 0 var(--ct-space-1);
                border: 1px solid transparent;
                border-radius: var(--ct-radius-md);
                font-size: var(--ct-font-size-xs);
                font-weight: var(--ct-font-weight-medium);
                line-height: 1.2;
                text-decoration: none;
                text-align: center;
                white-space: nowrap;
                cursor: pointer;
                transition: all var(--ct-transition-fast);
                user-select: none;
                vertical-align: middle;
                min-height: 32px; /* Consistent minimum height */
                box-sizing: border-box;
            }
            
            .action-btn:hover {
                transform: translateY(-1px);
                box-shadow: var(--ct-shadow-sm);
            }
            
            .action-btn:active {
                transform: translateY(0);
                box-shadow: var(--ct-shadow-xs);
            }
            
            .action-btn:focus {
                outline: 2px solid var(--ct-primary-500);
                outline-offset: 2px;
            }
            
            .action-btn.download-doc {
                background-color: var(--ct-success-500);
                color: var(--ct-white);
                border-color: var(--ct-success-600);
            }
            
            .action-btn.download-doc:hover {
                background-color: var(--ct-success-600);
            }
            
            /* === BUTTON COMPONENT SYSTEM === */
            /* Base Button Styles */
            .ct-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: var(--ct-space-2);
                padding: var(--ct-space-2) var(--ct-space-3);
                border: 1px solid transparent;
                border-radius: var(--ct-radius-md);
                font-size: var(--ct-font-size-sm);
                font-weight: var(--ct-font-weight-medium);
                line-height: 1.5;
                text-decoration: none;
                text-align: center;
                white-space: nowrap;
                cursor: pointer;
                transition: all var(--ct-transition-fast);
                user-select: none;
                vertical-align: middle;
            }
            
            .ct-btn:hover {
                transform: translateY(-1px);
                box-shadow: var(--ct-shadow-sm);
            }
            
            .ct-btn:active {
                transform: translateY(0);
                box-shadow: var(--ct-shadow-xs);
            }
            
            .ct-btn:focus {
                outline: 2px solid var(--ct-primary-500);
                outline-offset: 2px;
            }
            
            .ct-btn:disabled {
                background-color: var(--ct-gray-100);
                color: var(--ct-gray-400);
                border-color: var(--ct-gray-200);
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
                opacity: 0.6;
            }
            
            /* Button Sizes */
            .ct-btn--xs {
                padding: var(--ct-space-1) var(--ct-space-2);
                font-size: var(--ct-font-size-xs);
                gap: var(--ct-space-1);
            }
            
            .ct-btn--sm {
                padding: var(--ct-space-2) var(--ct-space-3);
                font-size: var(--ct-font-size-sm);
            }
            
            .ct-btn--md {
                padding: var(--ct-space-3) var(--ct-space-4);
                font-size: var(--ct-font-size-base);
            }
            
            .ct-btn--lg {
                padding: var(--ct-space-4) var(--ct-space-6);
                font-size: var(--ct-font-size-lg);
            }
            
            /* Button Variants */
            .ct-btn--primary {
                background-color: var(--ct-primary-500);
                color: var(--ct-white);
                border-color: var(--ct-primary-500);
            }
            
            .ct-btn--primary:hover {
                background-color: var(--ct-primary-600);
                border-color: var(--ct-primary-600);
            }
            
            .ct-btn--secondary {
                background-color: var(--ct-gray-600);
                color: var(--ct-white);
                border-color: var(--ct-gray-600);
            }
            
            .ct-btn--secondary:hover {
                background-color: var(--ct-gray-700);
                border-color: var(--ct-gray-700);
            }
            
            .ct-btn--success {
                background-color: var(--ct-success-500);
                color: var(--ct-white);
                border-color: var(--ct-success-500);
            }
            
            .ct-btn--success:hover {
                background-color: var(--ct-success-600);
                border-color: var(--ct-success-600);
            }
            
            .ct-btn--danger {
                background-color: var(--ct-danger-500);
                color: var(--ct-white);
                border-color: var(--ct-danger-500);
            }
            
            .ct-btn--danger:hover {
                background-color: var(--ct-danger-600);
                border-color: var(--ct-danger-600);
            }
            
            .ct-btn--warning {
                background-color: var(--ct-warning-500);
                color: var(--ct-white);
                border-color: var(--ct-warning-500);
            }
            
            .ct-btn--warning:hover {
                background-color: var(--ct-warning-600);
                border-color: var(--ct-warning-600);
            }
            
            .ct-btn--info {
                background-color: var(--ct-info-500);
                color: var(--ct-white);
                border-color: var(--ct-info-500);
            }
            
            .ct-btn--info:hover {
                background-color: var(--ct-info-600);
                border-color: var(--ct-info-600);
            }
            
            .ct-btn--purple {
                background-color: var(--ct-purple-500);
                color: var(--ct-white);
                border-color: var(--ct-purple-500);
            }
            
            .ct-btn--purple:hover {
                background-color: var(--ct-purple-600);
                border-color: var(--ct-purple-600);
            }
            
            /* Outline Variants */
            .ct-btn--outline {
                background-color: transparent;
                color: var(--ct-primary-500);
                border-color: var(--ct-primary-500);
            }
            
            .ct-btn--outline:hover {
                background-color: var(--ct-primary-500);
                color: var(--ct-white);
            }
            
            .ct-btn--outline-secondary {
                background-color: transparent;
                color: var(--ct-gray-600);
                border-color: var(--ct-gray-600);
            }
            
            .ct-btn--outline-secondary:hover {
                background-color: var(--ct-gray-600);
                color: var(--ct-white);
            }
            
            /* Ghost Variants */
            .ct-btn--ghost {
                background-color: transparent;
                color: var(--ct-gray-700);
                border-color: transparent;
            }
            
            .ct-btn--ghost:hover {
                background-color: var(--ct-gray-100);
                color: var(--ct-gray-900);
            }
            
            .ct-btn--ghost-light {
                background-color: transparent;
                color: var(--ct-white);
                border-color: transparent;
            }
            
            .ct-btn--ghost-light:hover {
                background-color: rgba(255, 255, 255, 0.1);
                color: var(--ct-white);
            }
            
            /* Special Button Types */
            .ct-btn--icon-only {
                padding: var(--ct-space-2);
                width: auto;
                aspect-ratio: 1;
            }
            
            .ct-btn--full-width {
                width: 100%;
            }
            
            .ct-btn--loading {
                position: relative;
                color: transparent;
            }
            
            .ct-btn--loading::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 16px;
                height: 16px;
                border: 2px solid currentColor;
                border-top-color: transparent;
                border-radius: 50%;
                animation: ct-spin 1s linear infinite;
            }
            
            @keyframes ct-spin {
                to {
                    transform: translate(-50%, -50%) rotate(360deg);
                }
            }
            
            /* Button Group Component */
            .ct-btn-group {
                display: inline-flex;
                border-radius: var(--ct-radius-md);
                overflow: hidden;
                box-shadow: var(--ct-shadow-sm);
                align-items: center; /* Ensure buttons are vertically centered */
                vertical-align: middle;
            }
            
            .ct-btn-group .ct-btn {
                border-radius: 0;
                border-right: 1px solid var(--ct-gray-300);
                margin: 0;
            }
            
            .ct-btn-group .ct-btn:first-child {
                border-top-left-radius: var(--ct-radius-md);
                border-bottom-left-radius: var(--ct-radius-md);
            }
            
            .ct-btn-group .ct-btn:last-child {
                border-top-right-radius: var(--ct-radius-md);
                border-bottom-right-radius: var(--ct-radius-md);
                border-right: none;
            }
            
            .ct-btn-group .ct-btn:hover {
                z-index: 1;
                position: relative;
            }
            
            /* Legacy Button Classes (for backward compatibility) */
            .action-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: var(--ct-space-1);
                padding: var(--ct-space-1) var(--ct-space-2);
                margin: 0 var(--ct-space-1);
                border: 1px solid transparent;
                border-radius: var(--ct-radius-md);
                font-size: var(--ct-font-size-xs);
                font-weight: var(--ct-font-weight-medium);
                line-height: 1.5;
                text-decoration: none;
                text-align: center;
                white-space: nowrap;
                cursor: pointer;
                transition: all var(--ct-transition-fast);
                user-select: none;
                vertical-align: middle;
            }
            
            .action-btn:hover {
                transform: translateY(-1px);
                box-shadow: var(--ct-shadow-sm);
            }
            
            .action-btn:active {
                transform: translateY(0);
                box-shadow: var(--ct-shadow-xs);
            }
            
            .action-btn:focus {
                outline: 2px solid var(--ct-primary-500);
                outline-offset: 2px;
            }
            
            .action-btn:disabled {
                background-color: var(--ct-gray-100);
                color: var(--ct-gray-400);
                border-color: var(--ct-gray-200);
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
                opacity: 0.6;
            }
            
            .action-btn.open-case {
                background-color: var(--ct-gray-600);
                color: var(--ct-white);
                border-color: var(--ct-gray-600);
            }
            
            .action-btn.open-case:hover {
                background-color: var(--ct-gray-700);
                border-color: var(--ct-gray-700);
            }
            
            .action-btn.view-docs {
                background-color: var(--ct-primary-500);
                color: var(--ct-white);
                border-color: var(--ct-primary-500);
            }
            
            .action-btn.view-docs:hover {
                background-color: var(--ct-primary-600);
                border-color: var(--ct-primary-600);
            }
            
            .action-btn.view-users {
                background-color: var(--ct-info-500);
                color: var(--ct-white);
                border-color: var(--ct-info-500);
            }
            
            .action-btn.view-users:hover {
                background-color: var(--ct-info-600);
                border-color: var(--ct-info-600);
            }
            
            .action-btn.download-doc {
                background-color: var(--ct-success-500);
                color: var(--ct-white);
                border-color: var(--ct-success-500);
            }
            
            .action-btn.download-doc:hover {
                background-color: var(--ct-success-600);
                border-color: var(--ct-success-600);
            }
            
            .action-btn.review-refund-case {
                background-color: var(--ct-purple-500);
                color: var(--ct-white);
                border-color: var(--ct-purple-500);
            }
            
            .action-btn.review-refund-case:hover {
                background-color: var(--ct-purple-600);
                border-color: var(--ct-purple-600);
            }
            
            /* Standardize all refund review buttons */
            .review-refund-case,
            .ct-btn.review-refund-case {
                background-color: var(--ct-purple-500) !important;
                color: var(--ct-white) !important;
                border-color: var(--ct-purple-500) !important;
            }
            
            .review-refund-case:hover,
            .ct-btn.review-refund-case:hover {
                background-color: var(--ct-purple-600) !important;
                border-color: var(--ct-purple-600) !important;
                transform: translateY(-1px);
                box-shadow: var(--ct-shadow-sm);
            }
            
            .review-refund-case:active,
            .ct-btn.review-refund-case:active {
                transform: translateY(0);
                box-shadow: var(--ct-shadow-xs);
            }
            
            /* Standardize all reload buttons */
            .reload-btn,
            #reload-profile-btn,
            #reload-docs-btn,
            #reload-users-btn,
            #reload-refund-btn,
            #reload-routing-btn,
            #auth-reload-btn {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: var(--ct-space-2) !important;
                padding: var(--ct-space-3) var(--ct-space-4) !important;
                border: 1px solid var(--ct-primary-500) !important;
                border-radius: var(--ct-radius-md) !important;
                background-color: var(--ct-primary-500) !important;
                color: var(--ct-white) !important;
                font-size: var(--ct-font-size-sm) !important;
                font-weight: var(--ct-font-weight-semibold) !important;
                line-height: 1.5 !important;
                text-decoration: none !important;
                text-align: center !important;
                white-space: nowrap !important;
                cursor: pointer !important;
                transition: all var(--ct-transition-fast) !important;
                user-select: none !important;
                vertical-align: middle !important;
                margin-top: 0 !important;
            }
            
            .reload-btn:hover,
            #reload-profile-btn:hover,
            #reload-docs-btn:hover,
            #reload-users-btn:hover,
            #reload-refund-btn:hover,
            #reload-routing-btn:hover,
            #auth-reload-btn:hover {
                background-color: var(--ct-primary-600) !important;
                border-color: var(--ct-primary-600) !important;
                transform: translateY(-1px);
                box-shadow: var(--ct-shadow-md);
            }
            
            .reload-btn:active,
            #reload-profile-btn:active,
            #reload-docs-btn:active,
            #reload-users-btn:active,
            #reload-refund-btn:active,
            #reload-routing-btn:active,
            #auth-reload-btn:active {
                transform: translateY(0);
                box-shadow: var(--ct-shadow-xs);
            }
            
            .reload-btn:focus,
            #reload-profile-btn:focus,
            #reload-docs-btn:focus,
            #reload-users-btn:focus,
            #reload-refund-btn:focus,
            #reload-routing-btn:focus,
            #auth-reload-btn:focus {
                outline: 2px solid var(--ct-primary-500);
                outline-offset: 2px;
            }
            

            
            /* Print-specific styles */
            @media print {
                #ct-sidebar {
                    display: none !important;
                }
                
                #ct-sidebar-toggle {
                    display: none !important;
                }
                
                .filter-container {
                    display: none !important;
                }
                
                .ct-tab-button {
                    display: none !important;
                }
                
                #ct-profile-section {
                    display: none !important;
                }
                
                .results-container {
                    margin: 0 !important;
                    padding: 0 !important;
                }
                
                .ct-table {
                    border-collapse: collapse !important;
                    width: 100% !important;
                }
                
                .ct-table th,
                .ct-table td {
                    border: 1px solid #000 !important;
                    padding: 8px !important;
                    font-size: 12px !important;
                }
                
                .actions-cell {
                    display: none !important;
                }
            }
            
            .ct-back-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: var(--ct-space-2);
                padding: var(--ct-space-2) var(--ct-space-3);
                background: transparent;
                border: 1px solid var(--ct-white);
                border-radius: var(--ct-radius-md);
                color: var(--ct-white);
                font-size: var(--ct-font-size-sm);
                font-weight: var(--ct-font-weight-medium);
                line-height: 1.5;
                text-decoration: none;
                text-align: center;
                white-space: nowrap;
                cursor: pointer;
                transition: all var(--ct-transition-fast);
                user-select: none;
                vertical-align: middle;
            }
            
            .ct-back-btn:hover {
                background-color: rgba(255, 255, 255, 0.1);
                color: var(--ct-white);
                transform: translateY(-1px);
            }
            
            .ct-back-btn:active {
                transform: translateY(0);
            }
            
            .ct-back-btn:focus {
                outline: 2px solid var(--ct-white);
                outline-offset: 2px;
            }
             
             /* === ENHANCED LAYOUT SYSTEM === */
             /* Container Components */
             .ct-container {
                 width: 100%;
                 max-width: 1200px;
                 margin: 0 auto;
                 padding: 0 var(--ct-space-4);
             }
             
             .ct-container--sm {
                 max-width: 640px;
             }
             
             .ct-container--md {
                 max-width: 768px;
             }
             
             .ct-container--lg {
                 max-width: 1024px;
             }
             
             .ct-container--xl {
                 max-width: 1280px;
             }
             
             .ct-container--fluid {
                 max-width: none;
             }
             
             /* Card Components */
             .ct-card {
                 background-color: var(--ct-white);
                 border: 1px solid var(--ct-gray-200);
                 border-radius: var(--ct-radius-lg);
                 box-shadow: var(--ct-shadow-sm);
                 overflow: hidden;
             }
             
             .ct-card--elevated {
                 box-shadow: var(--ct-shadow-md);
             }
             
             .ct-card--bordered {
                 border: 2px solid var(--ct-gray-200);
             }
             
             .ct-card-header {
                 padding: var(--ct-space-4);
                 border-bottom: 1px solid var(--ct-gray-200);
                 background-color: var(--ct-gray-50);
             }
             
             .ct-card-body {
                 padding: var(--ct-space-4);
             }
             
             .ct-card-footer {
                 padding: var(--ct-space-4);
                 border-top: 1px solid var(--ct-gray-200);
                 background-color: var(--ct-gray-50);
             }
             
             /* Grid System */
             .ct-grid {
                 display: grid;
                 gap: var(--ct-space-4);
             }
             
             .ct-grid--cols-1 { grid-template-columns: repeat(1, 1fr); }
             .ct-grid--cols-2 { grid-template-columns: repeat(2, 1fr); }
             .ct-grid--cols-3 { grid-template-columns: repeat(3, 1fr); }
             .ct-grid--cols-4 { grid-template-columns: repeat(4, 1fr); }
             .ct-grid--cols-5 { grid-template-columns: repeat(5, 1fr); }
             .ct-grid--cols-6 { grid-template-columns: repeat(6, 1fr); }
             
             .ct-grid--auto-fit {
                 grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
             }
             
             .ct-grid--auto-fill {
                 grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
             }
             
             /* Flexbox Utilities */
             .ct-flex { display: flex; }
             .ct-inline-flex { display: inline-flex; }
             .ct-flex-col { flex-direction: column; }
             .ct-flex-row { flex-direction: row; }
             .ct-flex-wrap { flex-wrap: wrap; }
             .ct-flex-nowrap { flex-wrap: nowrap; }
             
             .ct-flex-1 { flex: 1; }
             .ct-flex-auto { flex: auto; }
             .ct-flex-none { flex: none; }
             .ct-flex-grow { flex-grow: 1; }
             .ct-flex-shrink { flex-shrink: 1; }
             
             /* Alignment Utilities */
             .ct-items-start { align-items: flex-start; }
             .ct-items-center { align-items: center; }
             .ct-items-end { align-items: flex-end; }
             .ct-items-stretch { align-items: stretch; }
             .ct-items-baseline { align-items: baseline; }
             
             .ct-justify-start { justify-content: flex-start; }
             .ct-justify-center { justify-content: center; }
             .ct-justify-end { justify-content: flex-end; }
             .ct-justify-between { justify-content: space-between; }
             .ct-justify-around { justify-content: space-around; }
             .ct-justify-evenly { justify-content: space-evenly; }
             
             .ct-content-start { align-content: flex-start; }
             .ct-content-center { align-content: center; }
             .ct-content-end { align-content: flex-end; }
             .ct-content-between { align-content: space-between; }
             .ct-content-around { align-content: space-around; }
             .ct-content-evenly { align-content: space-evenly; }
             
             /* Gap Utilities */
             .ct-gap-0 { gap: 0; }
             .ct-gap-1 { gap: var(--ct-space-1); }
             .ct-gap-2 { gap: var(--ct-space-2); }
             .ct-gap-3 { gap: var(--ct-space-3); }
             .ct-gap-4 { gap: var(--ct-space-4); }
             .ct-gap-5 { gap: var(--ct-space-5); }
             .ct-gap-6 { gap: var(--ct-space-6); }
             .ct-gap-8 { gap: var(--ct-space-8); }
             
             .ct-gap-x-2 { column-gap: var(--ct-space-2); }
             .ct-gap-x-3 { column-gap: var(--ct-space-3); }
             .ct-gap-x-4 { column-gap: var(--ct-space-4); }
             
             .ct-gap-y-2 { row-gap: var(--ct-space-2); }
             .ct-gap-y-3 { row-gap: var(--ct-space-3); }
             .ct-gap-y-4 { row-gap: var(--ct-space-4); }
             
             /* Spacing Utilities */
             /* Padding */
             .ct-p-0 { padding: 0; }
             .ct-p-1 { padding: var(--ct-space-1); }
             .ct-p-2 { padding: var(--ct-space-2); }
             .ct-p-3 { padding: var(--ct-space-3); }
             .ct-p-4 { padding: var(--ct-space-4); }
             .ct-p-5 { padding: var(--ct-space-5); }
             .ct-p-6 { padding: var(--ct-space-6); }
             .ct-p-8 { padding: var(--ct-space-8); }
             
             .ct-px-0 { padding-left: 0; padding-right: 0; }
             .ct-px-1 { padding-left: var(--ct-space-1); padding-right: var(--ct-space-1); }
             .ct-px-2 { padding-left: var(--ct-space-2); padding-right: var(--ct-space-2); }
             .ct-px-3 { padding-left: var(--ct-space-3); padding-right: var(--ct-space-3); }
             .ct-px-4 { padding-left: var(--ct-space-4); padding-right: var(--ct-space-4); }
             .ct-px-6 { padding-left: var(--ct-space-6); padding-right: var(--ct-space-6); }
             
             .ct-py-0 { padding-top: 0; padding-bottom: 0; }
             .ct-py-1 { padding-top: var(--ct-space-1); padding-bottom: var(--ct-space-1); }
             .ct-py-2 { padding-top: var(--ct-space-2); padding-bottom: var(--ct-space-2); }
             .ct-py-3 { padding-top: var(--ct-space-3); padding-bottom: var(--ct-space-3); }
             .ct-py-4 { padding-top: var(--ct-space-4); padding-bottom: var(--ct-space-4); }
             .ct-py-6 { padding-top: var(--ct-space-6); padding-bottom: var(--ct-space-6); }
             
             /* Margin */
             .ct-m-0 { margin: 0; }
             .ct-m-1 { margin: var(--ct-space-1); }
             .ct-m-2 { margin: var(--ct-space-2); }
             .ct-m-3 { margin: var(--ct-space-3); }
             .ct-m-4 { margin: var(--ct-space-4); }
             .ct-m-5 { margin: var(--ct-space-5); }
             .ct-m-6 { margin: var(--ct-space-6); }
             .ct-m-8 { margin: var(--ct-space-8); }
             .ct-m-auto { margin: auto; }
             
             .ct-mx-0 { margin-left: 0; margin-right: 0; }
             .ct-mx-1 { margin-left: var(--ct-space-1); margin-right: var(--ct-space-1); }
             .ct-mx-2 { margin-left: var(--ct-space-2); margin-right: var(--ct-space-2); }
             .ct-mx-3 { margin-left: var(--ct-space-3); margin-right: var(--ct-space-3); }
             .ct-mx-4 { margin-left: var(--ct-space-4); margin-right: var(--ct-space-4); }
             .ct-mx-auto { margin-left: auto; margin-right: auto; }
             
             .ct-my-0 { margin-top: 0; margin-bottom: 0; }
             .ct-my-1 { margin-top: var(--ct-space-1); margin-bottom: var(--ct-space-1); }
             .ct-my-2 { margin-top: var(--ct-space-2); margin-bottom: var(--ct-space-2); }
             .ct-my-3 { margin-top: var(--ct-space-3); margin-bottom: var(--ct-space-3); }
             .ct-my-4 { margin-top: var(--ct-space-4); margin-bottom: var(--ct-space-4); }
             .ct-my-6 { margin-top: var(--ct-space-6); margin-bottom: var(--ct-space-6); }
             
             /* Position Utilities */
             .ct-relative { position: relative; }
             .ct-absolute { position: absolute; }
             .ct-fixed { position: fixed; }
             .ct-sticky { position: sticky; }
             
             /* Display Utilities */
             .ct-block { display: block; }
             .ct-inline { display: inline; }
             .ct-inline-block { display: inline-block; }
             .ct-hidden { display: none; }
             
             /* Width & Height Utilities */
             .ct-w-full { width: 100%; }
             .ct-w-auto { width: auto; }
             .ct-h-full { height: 100%; }
             .ct-h-auto { height: auto; }
             .ct-min-h-0 { min-height: 0; }
             .ct-min-h-full { min-height: 100%; }
             
             /* Overflow Utilities */
             .ct-overflow-hidden { overflow: hidden; }
             .ct-overflow-auto { overflow: auto; }
             .ct-overflow-scroll { overflow: scroll; }
             .ct-overflow-x-auto { overflow-x: auto; }
             .ct-overflow-y-auto { overflow-y: auto; }
             
             /* Text Utilities */
             .ct-text-left { text-align: left; }
             .ct-text-center { text-align: center; }
             .ct-text-right { text-align: right; }
             .ct-text-justify { text-align: justify; }
             
             .ct-truncate {
                 overflow: hidden;
                 text-overflow: ellipsis;
                 white-space: nowrap;
             }
             
             /* Border Utilities */
             .ct-border { border: 1px solid var(--ct-gray-200); }
             .ct-rounded { border-radius: var(--ct-radius-md); }
             .ct-rounded-lg { border-radius: var(--ct-radius-lg); }
             
             /* Shadow Utilities */
             .ct-shadow { box-shadow: var(--ct-shadow-sm); }
             .ct-shadow-md { box-shadow: var(--ct-shadow-md); }
             
             /* Background Utilities */
             .ct-bg-white { background-color: var(--ct-white); }
             .ct-bg-gray-50 { background-color: var(--ct-gray-50); }
             
             /* Text Size Utilities */
             .ct-text-xs { font-size: var(--ct-font-size-xs); }
             .ct-text-sm { font-size: var(--ct-font-size-sm); }
             
             /* Font Weight Utilities */
             .ct-font-medium { font-weight: var(--ct-font-weight-medium); }
             .ct-font-semibold { font-weight: var(--ct-font-weight-semibold); }
             
             /* Text Color Utilities */
             .ct-text-gray-500 { color: var(--ct-gray-500); }
             .ct-text-gray-700 { color: var(--ct-gray-700); }
             .ct-success-text { color: var(--ct-success-500); }
             .ct-error-text { color: var(--ct-error-500); }
             
             /* Margin Auto Utilities */
             .ct-ml-auto { margin-left: auto; }
             
             /* === ROUTING STYLES === */
             .routing-info {
                 padding: var(--ct-space-4);
             }
             
             .routing-section {
                 margin-bottom: var(--ct-space-6);
                 padding: var(--ct-space-4);
                 background: var(--ct-white);
                 border: 1px solid var(--ct-gray-200);
                 border-radius: var(--ct-radius-lg);
             }
             
             /* Table container for dynamic key-value tables */
             .ct-table-container {
                 overflow-x: auto;
                 border-radius: var(--ct-radius-md);
                 border: 1px solid var(--ct-gray-200);
                 max-width: 100%; /* Add max-width constraint */
                 width: 100%; /* Ensure full width usage */
             }
             
             .ct-table-container .ct-table {
                 margin: 0;
                 border-radius: 0;
                 border: none;
                 width: 100%; /* Ensure table uses full container width */
                 table-layout: fixed; /* Fixed layout for better control */
             }
             
             .ct-table-container .ct-table th {
                 background-color: var(--ct-gray-50);
                 font-weight: var(--ct-font-weight-semibold);
                 color: var(--ct-gray-700);
                 border-bottom: 2px solid var(--ct-gray-200);
                 width: 30%; /* Fixed width for key column */
             }
             
             .ct-table-container .ct-table td {
                 vertical-align: top;
                 word-break: break-word;
                 overflow-wrap: break-word; /* Better word wrapping */
                 max-width: 0; /* Allow flexible width distribution */
             }
             
             .ct-table-container .ct-table td:first-child {
                 width: 30%; /* Fixed width for key column */
                 min-width: 120px; /* Minimum width for readability */
             }
             
             .ct-table-container .ct-table td:last-child {
                 width: 70%; /* Remaining width for value column */
             }
             
             .ct-table-container .ct-table tbody tr:hover {
                 background-color: var(--ct-gray-50);
             }
             
             .routing-section h3 {
                 margin: 0 0 var(--ct-space-4) 0;
                 color: var(--ct-gray-900);
                 font-size: var(--ct-font-size-lg);
                 font-weight: var(--ct-font-weight-semibold);
                 display: flex;
                 align-items: center;
                 gap: var(--ct-space-2);
             }
             
             .section-title-badge {
                 display: inline-flex;
                 align-items: center;
                 padding: var(--ct-space-1) var(--ct-space-3);
                 border-radius: var(--ct-radius-full);
                 font-size: var(--ct-font-size-xs);
                 font-weight: var(--ct-font-weight-medium);
                 text-transform: uppercase;
                 letter-spacing: 0.5px;
             }
             
             .section-title-badge.running {
                 background-color: var(--ct-success-100);
                 color: var(--ct-success-700);
                 border: 1px solid var(--ct-success-200);
             }
             
             .section-title-badge.stopped {
                 background-color: var(--ct-gray-100);
                 color: var(--ct-gray-700);
                 border: 1px solid var(--ct-gray-200);
             }
             
             .ct-success-100 {
                 background-color: #dcfce7;
             }
             
             .ct-success-200 {
                 border-color: #bbf7d0;
             }
             
             .ct-success-700 {
                 color: #15803d;
             }
             
             .routing-grid {
                 display: grid;
                 grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                 gap: var(--ct-space-4);
             }
             
             .routing-item {
                 display: flex;
                 flex-direction: column;
                 gap: var(--ct-space-1);
             }
             
             .routing-item label {
                 font-size: var(--ct-font-size-sm);
                 font-weight: var(--ct-font-weight-medium);
                 color: var(--ct-gray-600);
             }
             
             .routing-item span {
                 font-size: var(--ct-font-size-sm);
                 color: var(--ct-gray-900);
             }
             
             .current-step {
                 font-weight: var(--ct-font-weight-semibold) !important;
                 color: var(--ct-primary-600) !important;
             }
             
             .status-badge {
                 display: inline-block;
                 padding: var(--ct-space-1) var(--ct-space-2);
                 border-radius: var(--ct-radius-md);
                 font-size: var(--ct-font-size-xs);
                 font-weight: var(--ct-font-weight-medium);
                 text-transform: uppercase;
             }
             
             .status-badge.running {
                 background-color: var(--ct-success-100);
                 color: var(--ct-success-700);
             }
             
             .status-badge.stopped {
                 background-color: var(--ct-gray-100);
                 color: var(--ct-gray-700);
             }
             
             .workflow-steps {
                 display: grid;
                 grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                 gap: var(--ct-space-4);
                 margin-top: var(--ct-space-4);
             }
             
             .workflow-step {
                 display: flex;
                 flex-direction: column;
                 gap: var(--ct-space-3);
                 padding: var(--ct-space-4);
                 border: 1px solid var(--ct-gray-200);
                 border-radius: var(--ct-radius-lg);
                 background: var(--ct-white);
                 box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
                 transition: all 0.2s ease;
                 position: relative;
                 overflow: hidden;
             }
             
             .workflow-step:hover {
                 box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                 transform: translateY(-1px);
             }
             
             .workflow-step.current {
                 border-color: var(--ct-primary-500);
                 background: var(--ct-primary-50);
                 box-shadow: 0 4px 6px -1px rgba(33, 44, 95, 0.1), 0 2px 4px -1px rgba(33, 44, 95, 0.06);
             }
             
             .workflow-step.current::before {
                 content: '';
                 position: absolute;
                 top: 0;
                 left: 0;
                 right: 0;
                 height: 4px;
                 background: var(--ct-primary-500);
             }
             
             .workflow-step.completed {
                 border-color: var(--ct-success-500);
                 background: var(--ct-success-50);
                 box-shadow: 0 4px 6px -1px rgba(34, 197, 94, 0.1), 0 2px 4px -1px rgba(34, 197, 94, 0.06);
             }
             
             .workflow-step.completed::before {
                 content: '';
                 position: absolute;
                 top: 0;
                 left: 0;
                 right: 0;
                 height: 4px;
                 background: var(--ct-success-500);
             }
             
             .step-header {
                 display: flex;
                 align-items: center;
                 gap: var(--ct-space-3);
                 margin-bottom: var(--ct-space-2);
             }
             
             .step-number {
                 display: flex;
                 align-items: center;
                 justify-content: center;
                 width: 40px;
                 height: 40px;
                 border-radius: 50%;
                 background: var(--ct-gray-200);
                 color: var(--ct-gray-700);
                 font-size: var(--ct-font-size-base);
                 font-weight: var(--ct-font-weight-bold);
                 flex-shrink: 0;
             }
             
             .workflow-step.current .step-number {
                 background: var(--ct-primary-500);
                 color: var(--ct-white);
             }
             
             .workflow-step.completed .step-number {
                 background: var(--ct-success-500);
                 color: var(--ct-white);
             }
             
             .step-content {
                 flex: 1;
             }
             
             .step-title {
                 font-size: var(--ct-font-size-base);
                 font-weight: var(--ct-font-weight-semibold);
                 color: var(--ct-gray-900);
                 margin-bottom: var(--ct-space-2);
                 line-height: 1.4;
             }
             
             .step-description {
                 font-size: var(--ct-font-size-sm);
                 color: var(--ct-gray-600);
                 margin-bottom: var(--ct-space-3);
                 line-height: 1.5;
             }
             
             .step-meta {
                 display: flex;
                 gap: var(--ct-space-2);
                 flex-wrap: wrap;
                 margin-top: auto;
             }
             
             .step-tag {
                 display: inline-block;
                 padding: var(--ct-space-1) var(--ct-space-3);
                 border-radius: var(--ct-radius-full);
                 font-size: var(--ct-font-size-xs);
                 font-weight: var(--ct-font-weight-medium);
                 text-transform: uppercase;
                 letter-spacing: 0.5px;
             }
             
             .step-tag.start {
                 background-color: var(--ct-success-100);
                 color: var(--ct-success-700);
             }
             
             .step-tag.final {
                 background-color: var(--ct-error-100);
                 color: var(--ct-error-700);
             }
             
             .step-tag.portal {
                 background-color: var(--ct-info-100);
                 color: var(--ct-info-700);
             }
             
             .context-items {
                 display: grid;
                 grid-template-columns: 1fr;
                 gap: var(--ct-space-3);
             }
             
             .context-item {
                 display: flex;
                 flex-direction: column;
                 gap: var(--ct-space-1);
             }
             
             .context-item label {
                 font-size: var(--ct-font-size-sm);
                 font-weight: var(--ct-font-weight-medium);
                 color: var(--ct-gray-600);
             }
             
             .context-item span {
                 font-size: var(--ct-font-size-sm);
                 color: var(--ct-gray-900);
                 padding: var(--ct-space-2);
                 background: var(--ct-gray-50);
                 border-radius: var(--ct-radius-md);
             }
             
             /* Component Utilities */
             .ct-loading-message {
                 padding: var(--ct-space-4);
                 color: var(--ct-gray-500);
                 text-align: center;
             }
             
             .ct-error-container {
                 padding: var(--ct-space-4);
                 color: var(--ct-error-500);
                 text-align: center;
             }
             
             .ct-error-subtitle {
                 margin: var(--ct-space-3) 0;
             }
             
             .ct-error-message {
                 color: var(--ct-error-500);
                 padding: var(--ct-space-4);
             }
             
             /* Responsive Utilities */
             @media (max-width: 640px) {
                 .ct-sm\:hidden { display: none; }
                 .ct-sm\:block { display: block; }
                 .ct-sm\:flex { display: flex; }
                 .ct-sm\:grid { display: grid; }
                 .ct-sm\:grid--cols-1 { grid-template-columns: repeat(1, 1fr); }
                 .ct-sm\:flex-col { flex-direction: column; }
                 .ct-sm\:text-center { text-align: center; }
             }
             
             @media (max-width: 768px) {
                 .ct-md\:hidden { display: none; }
                 .ct-md\:block { display: block; }
                 .ct-md\:flex { display: flex; }
                 .ct-md\:grid { display: grid; }
                 .ct-md\:grid--cols-1 { grid-template-columns: repeat(1, 1fr); }
                 .ct-md\:grid--cols-2 { grid-template-columns: repeat(2, 1fr); }
                 .ct-md\:flex-col { flex-direction: column; }
             }
             
             @media (max-width: 1024px) {
                 .ct-lg\:hidden { display: none; }
                 .ct-lg\:block { display: block; }
                 .ct-lg\:flex { display: flex; }
                 .ct-lg\:grid { display: grid; }
                 .ct-lg\:grid--cols-1 { grid-template-columns: repeat(1, 1fr); }
                 .ct-lg\:grid--cols-2 { grid-template-columns: repeat(2, 1fr); }
                 .ct-lg\:grid--cols-3 { grid-template-columns: repeat(3, 1fr); }
             }
             
             /* === CLEAN UI - HIDE SCROLLBARS === */
             /* Hide scrollbars for webkit browsers (Chrome, Safari, Edge) */
             #ct-sidebar,
             .ct-tab-panel,
             #ct-tab-content-area,
             .results-container,
             #tab-my-cases,
             .ct-results-table-container {
                 scrollbar-width: none; /* Firefox */
                 -ms-overflow-style: none; /* Internet Explorer 10+ */
             }
             
             #ct-sidebar::-webkit-scrollbar,
             .ct-tab-panel::-webkit-scrollbar,
             #ct-tab-content-area::-webkit-scrollbar,
             .results-container::-webkit-scrollbar,
             #tab-my-cases::-webkit-scrollbar,
             .ct-results-table-container::-webkit-scrollbar {
                 display: none; /* Webkit browsers */
             }
             
             /* Ensure scrolling still works */
             #ct-sidebar,
             .ct-tab-panel,
             #ct-tab-content-area,
             .results-container,
             #tab-my-cases,
             .ct-results-table-container {
                 overflow-y: auto;
                 overflow-x: hidden;
             }
             
             /* Optional: Add subtle scroll indicators on hover for better UX */
             .ct-scroll-container {
                 position: relative;
             }
             
             .ct-scroll-container::after {
                 content: '';
                 position: absolute;
                 top: 0;
                 right: 0;
                 width: 2px;
                 height: 100%;
                 background: linear-gradient(to bottom, transparent, var(--ct-gray-200), transparent);
                 opacity: 0;
                 transition: opacity var(--ct-transition-fast);
                 pointer-events: none;
             }
             
             .ct-scroll-container:hover::after {
                 opacity: 0.5;
             }
        
        /* === PROFILE STYLES === */
        .profile-info {
            padding: var(--ct-space-4);
            margin-bottom: 0; /* Remove bottom margin to prevent height inconsistencies */
        }
        
        /* Profile tab specific adjustments */
        #tab-profile .results-container {
            height: calc(100% - 120px); /* Match other tabs exactly */
            max-height: none; /* Let parent container control height */
        }
        
        #tab-profile .profile-info {
            padding: var(--ct-space-4);
            margin-bottom: 0 !important; /* Force removal of bottom margin */
        }
        
        .profile-section {
            margin-bottom: var(--ct-space-6);
            padding: var(--ct-space-4);
            background: var(--ct-white);
            border-radius: var(--ct-radius-md);
            box-shadow: var(--ct-shadow-sm);
        }
        
        .profile-section h3 {
            margin: 0 0 var(--ct-space-4) 0;
            color: var(--ct-gray-900);
            font-size: var(--ct-font-size-lg);
            font-weight: var(--ct-font-weight-semibold);
            border-bottom: 2px solid var(--ct-primary-500);
            padding-bottom: var(--ct-space-2);
        }
        
        .profile-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: var(--ct-space-3);
        }
        
        .profile-item {
            display: flex;
            flex-direction: column;
            gap: var(--ct-space-1);
        }
        
        .profile-item label {
            font-weight: var(--ct-font-weight-medium);
            color: var(--ct-gray-700);
            font-size: var(--ct-font-size-sm);
        }
        
        .profile-item span {
            color: var(--ct-gray-900);
            font-size: var(--ct-font-size-base);
            padding: var(--ct-space-2);
            background: var(--ct-gray-50);
            border-radius: var(--ct-radius-sm);
            border: 1px solid var(--ct-gray-200);
        }
        
        @media (max-width: 768px) {
            .profile-grid {
                grid-template-columns: 1fr;
            }
        }
             


             /* === ENHANCED RESPONSIVE DESIGN === */
             /* Extra Large screens (1400px and up) */
             @media (min-width: 1400px) {
                 #ct-sidebar {
                     width: var(--ct-sidebar-width); /* 950px */
                     right: calc(-1 * var(--ct-sidebar-width));
                 }
             }
             
             /* Large screens (1200px to 1399px) */
             @media (max-width: 1399px) and (min-width: 1200px) {
                 #ct-sidebar {
                     width: var(--ct-sidebar-width-lg); /* 850px */
                     right: calc(-1 * var(--ct-sidebar-width-lg));
                 }
             }
             
             /* Medium screens (992px to 1199px) */
             @media (max-width: 1199px) and (min-width: 992px) {
                 #ct-sidebar {
                     width: var(--ct-sidebar-width-md); /* 700px */
                     right: calc(-1 * var(--ct-sidebar-width-md));
                 }
             }
             
             /* Small to Medium screens (769px to 991px) */
             @media (max-width: 991px) and (min-width: 769px) {
                 #ct-sidebar {
                     width: 85vw;
                     right: -85vw;
                 }
                 
                 #ct-profile-section {
                     flex-direction: column;
                     gap: var(--ct-space-2);
                     padding: var(--ct-space-3);
                 }
                 
                 #ct-profile-right {
                     justify-content: space-between;
                     width: 100%;
                 }
                 
                 .ct-tab-button {
                     padding: var(--ct-space-2) var(--ct-space-3);
                     font-size: var(--ct-font-size-xs);
                 }
             }
             
             /* Mobile and Small tablets (768px and below) */
             @media (max-width: 768px) {
                 #ct-sidebar {
                     width: 100vw;
                     right: -100vw;
                     height: 100vh;
                     top: 0;
                     border-radius: 0;
                 }
                 
                 #ct-sidebar-toggle {
                     right: 0;
                     width: var(--ct-space-8);
                     height: var(--ct-space-20);
                     font-size: var(--ct-font-size-xs);
                 }
                 
                 #ct-profile-section {
                     flex-direction: column;
                     gap: var(--ct-space-2);
                     padding: var(--ct-space-3);
                 }
                 
                 #ct-navigation-area {
                     flex-direction: column;
                     align-items: flex-start;
                     gap: var(--ct-space-2);
                 }
                 
                 #ct-profile-right {
                     flex-direction: column;
                     align-items: stretch;
                     gap: var(--ct-space-2);
                 }
                 
                 #ct-profile-info {
                     align-items: flex-start;
                     text-align: left;
                 }
                 
                 .ct-language-buttons {
                     justify-content: center;
                 }
                 
                 #ct-tab-bar {
                     flex-wrap: wrap;
                 }
                 
                 .ct-tab-button {
                     flex: 1;
                     min-width: 0;
                     padding: var(--ct-space-2);
                     font-size: var(--ct-font-size-xs);
                 }
                 
                 #ct-tab-content-area {
                     padding: var(--ct-space-2);
                 }
                 
                 .filter-container {
                     flex-direction: column;
                     align-items: stretch;
                     gap: var(--ct-space-2);
                 }
                 
                 .ct-results-table {
                     font-size: var(--ct-font-size-xs);
                 }
                 
                 .ct-results-table td,
                 .ct-results-table th {
                     padding: var(--ct-space-2);
                 }
                 
                 .action-btn {
                     font-size: var(--ct-font-size-2xs);
                     padding: var(--ct-space-1) var(--ct-space-2);
                 }
                 
                 /* Optimize table display for mobile */
                 .ct-table {
                     font-size: var(--ct-font-size-xs);
                 }
                 
                 .ct-table th,
                 .ct-table td {
                     padding: var(--ct-space-1) var(--ct-space-2);
                 }
                 
                 /* Stack profile grid items on mobile */
                 .profile-grid {
                     grid-template-columns: 1fr;
                     gap: var(--ct-space-2);
                 }
                 
                 /* Adjust routing grid for mobile */
                 .routing-grid {
                     grid-template-columns: 1fr;
                     gap: var(--ct-space-2);
                 }
                 
                 /* Optimize workflow steps for mobile */
                 .workflow-steps {
                     grid-template-columns: 1fr;
                     gap: var(--ct-space-3);
                 }
             }
             
             /* Very small mobile devices (480px and below) */
             @media (max-width: 480px) {
                 #ct-sidebar-toggle {
                     width: var(--ct-space-6);
                     height: var(--ct-space-16);
                     font-size: var(--ct-font-size-2xs);
                     padding: var(--ct-space-2) var(--ct-space-1);
                 }
                 
                 #ct-profile-section {
                     padding: var(--ct-space-2);
                 }
                 
                 #ct-nav-title {
                     font-size: var(--ct-font-size-base);
                 }
                 
                 .ct-tab-button {
                     padding: var(--ct-space-1) var(--ct-space-2);
                     font-size: var(--ct-font-size-2xs);
                     min-height: 40px;
                 }
                 
                 #ct-tab-content-area {
                     padding: var(--ct-space-1);
                 }
                 
                 .ct-table th,
                 .ct-table td {
                     padding: var(--ct-space-1);
                     font-size: var(--ct-font-size-2xs);
                 }
                 
                 .profile-item span {
                     padding: var(--ct-space-1);
                     font-size: var(--ct-font-size-sm);
                 }
                 
                 .workflow-step {
                     padding: var(--ct-space-2);
                 }
                 
                 .step-number {
                     width: 28px;
                     height: 28px;
                     font-size: var(--ct-font-size-xs);
                 }
             }
             
             /* Landscape orientation adjustments for tablets */
             @media (max-width: 1024px) and (orientation: landscape) {
                 #ct-sidebar {
                     width: 70vw;
                     right: -70vw;
                 }
                 
                 .ct-tab-panel {
                     max-height: calc(100vh - 200px);
                 }
             }
             
             /* High DPI displays adjustments */
             @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
                 #ct-sidebar {
                     box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                 }
                 
                 #ct-sidebar-toggle {
                     box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                 }
             }
        `);
    }

    function createSidebar() {
        // Create the toggle button separately (outside the sidebar)
        const toggleButton = document.createElement('button');
        toggleButton.id = 'ct-sidebar-toggle';
        toggleButton.textContent = 'CoreTabs';
        document.body.appendChild(toggleButton);

        // Create the sidebar container
        const sidebarContainer = document.createElement('div');
        sidebarContainer.innerHTML = `
            <div id="ct-sidebar">
              <!-- Profile Section -->
              <div id="ct-profile-section">
                <div id="ct-navigation-area">
                  <button id="ct-nav-back-btn" style="display: none;">← Back</button>
                  <div id="ct-nav-title">My Cases</div>
                </div>
                <div id="ct-profile-right">
                  <div id="ct-profile-info">
                    <div id="ct-profile-name">Loading...</div>
                    <div id="ct-profile-email">Loading...</div>
                  </div>
                  <div id="ct-language-switcher-container"></div>
                </div>
              </div>
              
              <!-- My Cases Screen -->
              <div id="ct-my-cases-screen" class="ct-screen active">
                <div id="tab-my-cases" class="ct-tab-panel active">
                  <div class="filter-container">
                      <div><label for="cases-status-filter">Filter by Status:</label><select id="cases-status-filter"></select></div>
                      <button id="toggle-cases-btn" class="ct-btn ct-btn--sm ct-btn--ghost">Collapse All</button>
                    </div>
                  <div class="results-container">
                    <p class="ct-loading-message">Loading my cases...</p>
                  </div>
                </div>
              </div>
              
              <!-- Case Details Screen -->
              <div id="ct-case-details-screen" class="ct-screen">
                <div id="ct-header-area">
                  <div id="ct-header-icon">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V6h5.17l2 2H20v10z"/></svg>
                  </div>
                  <div id="ct-header-text">
                    <div id="ct-header-title">
                        <span id="ct-header-title-text">No Case Selected</span>
                        <span id="ct-header-initial"></span>
                    </div>
                    <div id="ct-header-subtitle">Please select a case from the "My Cases" screen</div>
                  </div>
                  <div id="ct-header-actions"></div>
                </div>
                <div id="ct-tab-bar">
                  <button class="ct-tab-button active" data-tab="tab-profile">Profile</button>
                  <button class="ct-tab-button" data-tab="tab-docs">Documents</button>
                  <button class="ct-tab-button" data-tab="tab-users">Users</button>
                  <button class="ct-tab-button" data-tab="tab-routing">Routing</button>
                  <button class="ct-tab-button" data-tab="tab-refund" style="display: none;">Refund Review</button>
                </div>
                <div id="ct-tab-content-area">
                  <div id="tab-profile" class="ct-tab-panel active">
                    <div class="filter-container">
                      <button id="reload-profile-btn" class="ct-btn ct-btn--sm ct-btn--primary">Reload</button>
                    </div>
                    <div class="results-container">
                      <p class="ct-loading-message">Please select a case to view its profile information.</p>
                    </div>
                  </div>
                  <div id="tab-docs" class="ct-tab-panel">
                    <div class="filter-container">
                      <div><label for="docs-status-filter">Filter by Status:</label><select id="docs-status-filter"></select></div>
                      <button id="toggle-docs-btn" class="ct-btn ct-btn--sm ct-btn--ghost">Collapse All</button>
                      <button id="reload-docs-btn" class="ct-btn ct-btn--sm ct-btn--primary">Reload</button>
                    </div>
                    <div class="results-container">
                      <p class="ct-loading-message">Please select a case to view its documents.</p>
                    </div>
                  </div>
                  <div id="tab-users" class="ct-tab-panel">
                    <div class="filter-container">
                      <div><label for="users-role-filter">Filter by Role:</label><select id="users-role-filter"></select></div>
                      <button id="toggle-users-btn" class="ct-btn ct-btn--sm ct-btn--ghost">Collapse All</button>
                      <button id="reload-users-btn" class="ct-btn ct-btn--sm ct-btn--primary">Reload</button>
                    </div>
                    <div class="results-container">
                      <p class="ct-loading-message">Please select a case to view its users.</p>
                    </div>
                  </div>
                  <div id="tab-routing" class="ct-tab-panel">
                    <div class="filter-container">
                      <button id="reload-routing-btn" class="ct-btn ct-btn--sm ct-btn--primary">Reload</button>
                    </div>
                    <div class="results-container">
                      <p class="ct-loading-message">Please select a case to view its routing information.</p>
                    </div>
                  </div>
                  <div id="tab-refund" class="ct-tab-panel">
                    <div class="filter-container">
                      <div><label for="refund-reported-filter">Filter by Reported:</label><select id="refund-reported-filter"></select></div>
                      <button id="toggle-refund-btn" class="ct-btn ct-btn--sm ct-btn--ghost">Collapse All</button>
                      <button id="refund-download-btn" class="ct-btn ct-btn--sm ct-btn--success">Download Excel</button>
                      <button id="reload-refund-btn" class="ct-btn ct-btn--sm ct-btn--primary">Reload</button>
                    </div>
                    <div class="results-container">
                      <p class="ct-loading-message">Select a refund case and click "Refund Review" in the header or row.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        `;
        document.body.appendChild(sidebarContainer);
    }

    // --- RENDER FUNCTIONS ---
    function renderMyCasesTable() {
        const responseArea = document.querySelector("#tab-my-cases .results-container");
        const filterValue = document.getElementById("cases-status-filter").value;
        const filteredCases = filterValue === "all" ? allMyCases : allMyCases.filter(c => c.CaseStatus === filterValue);
        if (document.getElementById("toggle-cases-btn").textContent = "Collapse All", 0 === filteredCases.length) return void (responseArea.innerHTML = '<p class="ct-loading-message">No cases match the selected filter.</p>');
        filteredCases.sort((a, b) => {
            const typeCompare = (a.CaseTypeName || "").localeCompare(b.CaseTypeName || "");
            if (typeCompare !== 0) return typeCompare;
            return (b.CaseNumber || "").localeCompare(a.CaseNumber || "", void 0, { numeric: true });
        });
        const table = createTable([t('case_number'), t('taxpayer_name_tin'), t('case_type'), t('status'), t('created_date'), t('actions')]);
        const tbody = document.createElement("tbody");
        let currentGroup = "";
        let groupIndex = 0;
        filteredCases.forEach(caseItem => {
            if (caseItem.CaseTypeName !== currentGroup) {
                currentGroup = caseItem.CaseTypeName;
                groupIndex++;
                const tr = document.createElement('tr');
                tr.className = 'group-header expanded';
                tr.dataset.groupId = `my-cases-group-${groupIndex}`;
                const td = document.createElement('td');
                td.colSpan = 6;
                const span = document.createElement('span');
                span.className = 'toggle-icon';
                td.appendChild(span);
                td.appendChild(document.createTextNode(currentGroup || 'Uncategorized'));
                tr.appendChild(td);
                tbody.appendChild(tr);
            }
            const tr = document.createElement("tr");
            tr.className = `group-member my-cases-group-${groupIndex}`;
            const caseId = caseItem.AggregateIdentifier;
            tr.dataset.id = caseId;
            if (caseId === selectedCaseId) tr.classList.add("selected");
            const createdDate = formatDateCustom(caseItem.CreatedDate);
            const hasValidId = caseId && typeof caseId === "string" && caseId.trim() !== "";
            const disabledAttribute = hasValidId ? "" : 'disabled title="Action unavailable: Case ID is missing"';
            let refundButtonHtml = "";
            if (caseItem.CaseTypeName === REFUND_CASE_TYPE_NAME) {
                refundButtonHtml = `<button class="ct-btn ct-btn--xs ct-btn--info review-refund-case" data-id="${caseId}">${t('refund_review')}</button>`;
            }

            let nameCellHtml = `<div>${caseItem.MainTaxpayerName || "N/A"}</div>`;
            if (caseItem.MainTaxpayerTIN && caseItem.MainTaxpayerTIN.toLowerCase() !== 'n/a') {
                nameCellHtml += `<div class="subtitle-tin">${caseItem.MainTaxpayerTIN}</div>`;
            }

            // Create cells safely using DOM methods
            const caseNumberCell = document.createElement('td');
            caseNumberCell.className = 'ct-numeric';
            caseNumberCell.textContent = caseItem.CaseNumber || 'N/A';
            tr.appendChild(caseNumberCell);

            const nameCell = document.createElement('td');
            nameCell.innerHTML = nameCellHtml; // This is already safely constructed above
            tr.appendChild(nameCell);

            const typeCell = document.createElement('td');
            typeCell.textContent = caseItem.CaseTypeName || 'N/A';
            tr.appendChild(typeCell);

            const statusCell = document.createElement('td');
            statusCell.textContent = translateStatus(caseItem.CaseStatus) || 'N/A';
            tr.appendChild(statusCell);

            const dateCell = document.createElement('td');
            dateCell.textContent = createdDate;
            tr.appendChild(dateCell);

            // Create actions cell with proper DOM methods
            const actionsCell = document.createElement('td');
            actionsCell.className = 'actions-cell';

            // Create open link
            const openLink = document.createElement('a');
            openLink.href = `https://coretax.intranet.pajak.go.id/case-management/id-ID/case-overview/${caseId}`;
            openLink.className = 'ct-btn ct-btn--xs ct-btn--outline open-case';
            openLink.textContent = t('open');
            if (!hasValidId) {
                openLink.setAttribute('disabled', 'true');
                openLink.setAttribute('title', 'Action unavailable: Case ID is missing');
            }
            actionsCell.appendChild(openLink);

            // Create button group
            const buttonGroup = document.createElement('div');
            buttonGroup.className = 'ct-btn-group';

            const docsButton = document.createElement('button');
            docsButton.className = 'ct-btn ct-btn--xs ct-btn--secondary view-docs';
            docsButton.dataset.id = caseId;
            docsButton.textContent = t('docs');
            if (!hasValidId) {
                docsButton.disabled = true;
                docsButton.setAttribute('title', 'Action unavailable: Case ID is missing');
            }
            buttonGroup.appendChild(docsButton);

            const usersButton = document.createElement('button');
            usersButton.className = 'ct-btn ct-btn--xs ct-btn--secondary view-users';
            usersButton.dataset.id = caseId;
            usersButton.textContent = t('users');
            if (!hasValidId) {
                usersButton.disabled = true;
                usersButton.setAttribute('title', 'Action unavailable: Case ID is missing');
            }
            buttonGroup.appendChild(usersButton);

            actionsCell.appendChild(buttonGroup);

            // Add refund button if applicable
            if (caseItem.CaseTypeName === REFUND_CASE_TYPE_NAME) {
                const refundButton = document.createElement('button');
                refundButton.className = 'ct-btn ct-btn--xs ct-btn--info review-refund-case';
                refundButton.dataset.id = caseId;
                refundButton.textContent = t('refund_review');
                actionsCell.appendChild(refundButton);
            }

            tr.appendChild(actionsCell);
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        responseArea.innerHTML = "";
        responseArea.appendChild(table);
        tbody.addEventListener("click", handleGroupToggle);
        tbody.addEventListener("click", handleCaseSelection);
    }
    function renderCaseDocumentsTable() {
        const responseArea = document.querySelector("#tab-docs .results-container"), filterValue = document.getElementById("docs-status-filter").value, filteredDocs = "all" === filterValue ? allCaseDocuments : allCaseDocuments.filter(e => e.DocumentStatus === filterValue); if (document.getElementById("toggle-docs-btn").textContent = "Collapse All", 0 === filteredDocs.length) return void (responseArea.innerHTML = '<p class="ct-loading-message">No documents found or match the selected filter.</p>'); filteredDocs.sort((e, t) => (e.DocumentTypeCode || "").localeCompare(t.DocumentTypeCode || "")); const table = createTable([t('letter_number'), t('file_name'), t('status'), t('date'), t('actions')]), tbody = document.createElement("tbody"); let currentGroup = ""; let groupIndex = 0; filteredDocs.forEach(e => {
            if (e.DocumentTypeCode !== currentGroup) { currentGroup = e.DocumentTypeCode; groupIndex++; tbody.innerHTML += `<tr class="group-header expanded" data-group-id="docs-group-${groupIndex}"><td colspan="5"><span class="toggle-icon"></span>${currentGroup || "Uncategorized"}</td></tr>` } const formattedDate = formatDateCustom(e.DocumentDate); tbody.innerHTML += `
                <tr class="group-member docs-group-${groupIndex}">
                    <td>${e.LetterNumber || "N/A"}</td>
                    <td>${e.FileName || "N/A"}</td>
                    <td>${translateStatus(e.DocumentStatus) || "N/A"}</td>
                    <td>${formattedDate}</td>
                    <td class="actions-cell">
                    <button class="ct-btn ct-btn--xs ct-btn--success download-doc" data-doc-id="${e.DocumentAggregateIdentifier}" data-filename="${e.OriginalName}">${t('download')}</button>
                    <button class="ct-btn ct-btn--xs ct-btn--secondary print-doc" data-doc-id="${e.DocumentAggregateIdentifier}" data-filename="${e.OriginalName}">${t('print')}</button>
                </td>
                </tr>`}), table.appendChild(tbody), responseArea.innerHTML = "", responseArea.appendChild(table), tbody.addEventListener("click", handleGroupToggle), tbody.addEventListener("click", handleDocumentAction)
    }
    function renderCaseUsersTable() {
        const responseArea = document.querySelector("#tab-users .results-container");
        const filterValue = document.getElementById("users-role-filter").value;
        const filteredUsers = filterValue === "all" ? allCaseUsers : allCaseUsers.filter(e => e.CaseRoleType === filterValue);

        // Set toggle button text
        document.getElementById("toggle-users-btn").textContent = "Collapse All";

        if (filteredUsers.length === 0) {
            responseArea.innerHTML = '<p class="ct-loading-message">No users found or match the selected filter.</p>';
            return;
        }

        // Group users by their unique identifier (FullName + NIP)
        const userGroups = new Map();
        filteredUsers.forEach(user => {
            const userKey = `${user.FullName || 'N/A'}_${user.Nip || 'N/A'}`;
            if (!userGroups.has(userKey)) {
                userGroups.set(userKey, {
                    FullName: user.FullName || 'N/A',
                    Nip: user.Nip || 'N/A',
                    Jabatan: user.Jabatan || 'N/A',
                    OfficeName: user.OfficeName || 'N/A',
                    roles: []
                });
            }
            userGroups.get(userKey).roles.push(translateStatus(user.CaseRoleType) || 'N/A');
        });

        // Group users by office
        const officeGroups = new Map();
        Array.from(userGroups.values()).forEach(user => {
            const officeName = user.OfficeName;
            if (!officeGroups.has(officeName)) {
                officeGroups.set(officeName, []);
            }
            officeGroups.get(officeName).push(user);
        });

        // Sort offices alphabetically and users within each office by NIP
        const sortedOffices = Array.from(officeGroups.keys()).sort();
        sortedOffices.forEach(officeName => {
            officeGroups.get(officeName).sort((a, b) => (a.Nip || '').localeCompare(b.Nip || ''));
        });

        const table = createTable([t('full_name'), t('nip'), t('position'), t('case_role')]);
        const tbody = document.createElement("tbody");

        let groupIndex = 0;
        sortedOffices.forEach(officeName => {
            const usersInOffice = officeGroups.get(officeName);
            groupIndex++;

            // Create office group header
            const headerRow = document.createElement('tr');
            headerRow.className = 'group-header expanded';
            headerRow.dataset.groupId = `users-group-${groupIndex}`;
            headerRow.innerHTML = `<td colspan="4"><span class="toggle-icon"></span>${officeName}</td>`;
            tbody.appendChild(headerRow);

            // Add users in this office
            usersInOffice.forEach(user => {
                // Create roles display with vertical stacking
                const rolesHtml = user.roles.map(role => `<div style="margin: 2px 0; padding: 2px 6px; background-color: var(--ct-gray-100); border-radius: var(--ct-radius-sm); font-size: var(--ct-font-size-xs);">${role}</div>`).join('');

                const tr = document.createElement('tr');
                tr.className = `group-member users-group-${groupIndex}`;
                tr.innerHTML = `
                    <td>${user.FullName}</td>
                    <td class="ct-numeric">${user.Nip}</td>
                    <td>${user.Jabatan}</td>
                    <td style="padding: var(--ct-space-2);">${rolesHtml}</td>
                `;
                tbody.appendChild(tr);
            });
        });

        table.appendChild(tbody);
        responseArea.innerHTML = "";
        responseArea.appendChild(table);
        tbody.addEventListener("click", handleGroupToggle);
    }
    function renderRefundReviewTable() {
        const responseArea = document.querySelector("#tab-refund .results-container"), filterValue = document.getElementById("refund-reported-filter").value; document.getElementById("refund-download-btn").disabled = !refundReviewData || 0 === refundReviewData.length, document.getElementById("toggle-refund-btn").textContent = "Collapse All"; let dataToRender = refundReviewData; "all" !== filterValue && (dataToRender = refundReviewData.filter(e => e.ReportedBySeller === ("true" === filterValue))), filteredRefundData = dataToRender; if (!dataToRender || 0 === dataToRender.length) return void (responseArea.innerHTML = '<p class="ct-loading-message">No refund review data matches the filter.</p>'); dataToRender.sort((e, t) => ((e.Tin || "") + (e.Name || "")).localeCompare((t.Tin || "") + (t.Name || ""))); const table = createTable([t('doc_number'), t('date'), t('selling_price'), t('vat_paid'), t('stlg_paid'), t('trans_code'), t('reported')]), tbody = document.createElement("tbody"); let currentGroupKey = ""; let groupIndex = 0; responseArea.innerHTML = "", table.appendChild(tbody), responseArea.appendChild(table), dataToRender.forEach(e => {
            const t = (e.Tin || "") + (e.Name || ""); if (t !== currentGroupKey) {
                currentGroupKey = t, groupIndex++; const o = tbody.insertRow(); o.className = "group-header expanded", o.dataset.groupId = `refund-group-${groupIndex}`; const a = o.insertCell(); a.colSpan = 7, a.innerHTML = `
                    <span class="toggle-icon"></span>
                    <span>
                        <div class="group-title">${e.Name || "Unknown Name"}</div>
                        <div class="group-subtitle">${e.Tin || "Unknown TIN"}</div>
                    </span>`} var o = tbody.insertRow(); o.className = `group-member refund-group-${groupIndex}`; var a = formatDateCustom(e.DocumentDate), s = e.ReportedBySeller ? '<span class="ct-success-text">✔</span>' : '<span class="ct-error-text">❌</span>'; o.insertCell().textContent = e.DocumentNumber || "N/A", o.insertCell().textContent = a; var r = o.insertCell(); r.innerHTML = `<div class="currency-wrapper"><span>Rp</span><span class="currency-num">${(e.SellingPrice || 0).toLocaleString("id-ID")}</span></div>`; var d = o.insertCell(); d.innerHTML = `<div class="currency-wrapper"><span>Rp</span><span class="currency-num">${(e.VatPaid || 0).toLocaleString("id-ID")}</span></div>`; var n = o.insertCell(); n.innerHTML = `<div class="currency-wrapper"><span>Rp</span><span class="currency-num">${(e.StlgPaid || 0).toLocaleString("id-ID")}</span></div>`, o.insertCell().textContent = e.TransactionCode || "N/A"; var c = o.insertCell(); c.className = "reported-cell", c.innerHTML = s
        }), tbody.addEventListener("click", handleGroupToggle)
    }

    // --- DATA FETCHING FUNCTIONS ---
    async function fetchMyCases() { const responseArea = document.querySelector("#tab-my-cases .results-container"); try { const authToken = getAuthToken(), apiUrl = "https://coretax.intranet.pajak.go.id/casemanagement/api/caselist/mycases", fetchOptions = { method: "POST", headers: getHeaders(), body: JSON.stringify({}) }, response = await fetch(apiUrl, fetchOptions); if (!response.ok) { const errorData = await response.json(); throw new Error(`API Error: ${errorData.Message || response.statusText}`) } const data = await response.json(); allMyCases = data?.Payload?.Data || [], populateFilter("cases-status-filter", allMyCases, "CaseStatus"); const casesFilter = document.getElementById("cases-status-filter"); Array.from(casesFilter.options).some(e => e.value === DEFAULT_CASES_FILTER) && (casesFilter.value = DEFAULT_CASES_FILTER), renderMyCasesTable() } catch (error) { handleError(error, responseArea) } }
    async function fetchCaseDocuments(caseId) { const responseArea = document.querySelector("#tab-docs .results-container"); responseArea.innerHTML = '<p class="ct-loading-message">Loading documents...</p>'; try { if (!caseId) throw new Error("No Case ID provided."); const apiUrl = "https://coretax.intranet.pajak.go.id/casemanagement/api/casedocument/list", fetchOptions = { method: "POST", headers: getHeaders(caseId), body: JSON.stringify({ AggregateIdentifier: caseId }) }, response = await fetch(apiUrl, fetchOptions); if (!response.ok) { const errorData = await response.json(); throw new Error(`API Error: ${errorData.Message || response.statusText}`) } const data = await response.json(); allCaseDocuments = data?.Payload?.Data || [], loadedDocsForCaseId = caseId, populateFilter("docs-status-filter", allCaseDocuments, "DocumentStatus"), renderCaseDocumentsTable() } catch (error) { handleError(error, responseArea) } }
    async function fetchCaseUsers(caseId) { const responseArea = document.querySelector("#tab-users .results-container"); responseArea.innerHTML = '<p class="ct-loading-message">Loading users...</p>'; try { if (!caseId) throw new Error("No Case ID provided."); const apiUrl = "https://coretax.intranet.pajak.go.id/casemanagement/api/caseuser/list", payload = { AggregateIdentifier: caseId, First: 0, Rows: 200, SortField: "", SortOrder: 1, Filters: [], LanguageId: "id-ID" }, fetchOptions = { method: "POST", headers: getHeaders(caseId), body: JSON.stringify(payload) }, response = await fetch(apiUrl, fetchOptions); if (!response.ok) { const errorData = await response.json(); throw new Error(`API Error: ${errorData.Message || response.statusText}`) } const data = await response.json(); allCaseUsers = data?.Payload?.Data || [], loadedUsersForCaseId = caseId, populateFilter("users-role-filter", allCaseUsers, "CaseRoleType"), renderCaseUsersTable() } catch (error) { handleError(error, responseArea) } }
    async function downloadDocument(docId, filename, button) {
        const originalText = button.textContent;
        button.textContent = t('downloading') || "Downloading...";
        button.disabled = true;

        try {
            const apiUrl = "https://coretax.intranet.pajak.go.id/documentmanagement/api/download";
            const payload = {
                DocumentAggregateIdentifier: docId,
                IsDocumentCases: false,
                IsNeedWatermark: null
            };
            const fetchOptions = {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(payload)
            };

            const response = await fetch(apiUrl, fetchOptions);

            if (!response.ok) {
                try {
                    const errorData = await response.json();
                    throw new Error(`API Error: ${errorData.Message || response.statusText}`);
                } catch (e) {
                    throw new Error(`API request failed! Status: ${response.statusText}`);
                }
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = filename || "download.pdf";
            document.body.appendChild(a);
            a.click();

            // Clean up immediately (like working old.js version)
            window.URL.revokeObjectURL(url);
            a.remove();

        } catch (error) {
            alert(`${t('download_failed') || 'Download failed'}: ${error.message}`);
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }
    async function printDocument(docId, filename, button) {
        const originalText = button.textContent;
        button.textContent = t('printing') || "Printing...";
        button.disabled = true;

        try {
            const apiUrl = "https://coretax.intranet.pajak.go.id/documentmanagement/api/download";
            const payload = {
                DocumentAggregateIdentifier: docId,
                IsDocumentCases: false,
                IsNeedWatermark: null
            };
            const fetchOptions = {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(payload)
            };

            const response = await fetch(apiUrl, fetchOptions);

            if (!response.ok) {
                try {
                    const errorData = await response.json();
                    throw new Error(`API Error: ${errorData.Message || response.statusText}`);
                } catch (e) {
                    throw new Error(`API request failed! Status: ${response.statusText}`);
                }
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Open in new tab for printing
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            document.body.appendChild(a);
            a.click();

            // Clean up immediately
            window.URL.revokeObjectURL(url);
            a.remove();

        } catch (error) {
            alert(`${t('print_failed') || 'Print failed'}: ${error.message}`);
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }
    async function fetchSubProcessId(caseId) { const apiUrl = "https://coretax.intranet.pajak.go.id/casemanagement/api/caserouting/view", payload = { AggregateIdentifier: caseId, LanguageId: "id-ID" }, fetchOptions = { method: "POST", headers: getHeaders(caseId), body: JSON.stringify(payload) }, response = await fetch(apiUrl, fetchOptions); if (!response.ok) { const errorData = await response.json(); throw new Error(`Sub Process ID API Error: ${errorData.Message || response.statusText}`) } const data = await response.json(), firstResult = data?.Payload?.[0]; if (!firstResult || !firstResult.SubProcessIdentifier) throw new Error("Could not find a 'SubProcessIdentifier' in the caserouting/view response."); return firstResult.SubProcessIdentifier }
    async function fetchC02FormDetail(caseId, subProcessId) { const apiUrl = "https://coretax.intranet.pajak.go.id/casecomponentspayment/api/c02form014/c02form009detail/current", payload = { caseAggregateIdentifier: caseId, CaseSubProcessIdentifier: subProcessId }, fetchOptions = { method: "POST", headers: getHeaders(caseId), body: JSON.stringify(payload) }, response = await fetch(apiUrl, fetchOptions); if (!response.ok) { const errorData = await response.json(); throw new Error(`C02Form Detail API Error: ${errorData.Message || response.statusText}`) } const data = await response.json(), firstResult = data?.Payload?.[0]; if (!firstResult || !firstResult.Reference) throw new Error("Could not find a 'Reference' number in the C02Form Detail response."); return firstResult.Reference }
    async function fetchRefundReview(caseId, refNumber) { const responseArea = document.querySelector("#tab-refund .results-container"); try { const apiUrl = "https://coretax.intranet.pajak.go.id/casecomponentspayment/api/refundprocessreview/get-detailed-review", payload = { CaseAggregateIdentifier: caseId, RevenueCode: "411211", TaxPaymentCode: "100", TaxReturnType: "VAT_VATR", ReferenceNumber: refNumber }, fetchOptions = { method: "POST", headers: getHeaders(caseId), body: JSON.stringify(payload) }, response = await fetch(apiUrl, fetchOptions); if (!response.ok) { const errorData = await response.json(); throw new Error(`Refund Review API Error: ${errorData.Message || response.statusText}`) } const data = await response.json(); refundReviewData = data?.Payload || [], populateBooleanFilter("refund-reported-filter"), renderRefundReviewTable() } catch (error) { handleError(error, responseArea) } }

    async function fetchCaseRouting(caseId) {
        const responseArea = document.querySelector("#tab-routing .results-container");
        responseArea.innerHTML = '<p class="ct-loading-message">Loading routing information...</p>';

        try {
            if (!caseId) throw new Error("No Case ID provided.");

            // First API call - Get case routing data
            const routingResponse = await fetch('https://coretax.intranet.pajak.go.id/casemanagement/api/caserouting/view', {
                method: 'POST',
                headers: getHeaders(caseId),
                body: JSON.stringify({
                    "AggregateIdentifier": caseId,
                    "LanguageId": "id-ID"
                })
            });

            if (!routingResponse.ok) {
                const errorData = await routingResponse.json();
                throw new Error(`Routing API Error: ${errorData.Message || routingResponse.statusText}`);
            }

            const routingData = await routingResponse.json();

            if (!routingData.IsSuccessful || !routingData.Payload || routingData.Payload.length === 0) {
                responseArea.innerHTML = `<p class="ct-error-message">No routing data available for this case.</p>`;
                return;
            }

            // Get the last object from payload array
            const lastPayloadItem = routingData.Payload[routingData.Payload.length - 1];
            const workflowIdentifier = lastPayloadItem.WorkflowIdentifier;
            const caseTypeIdentifier = lastPayloadItem.CaseTypeIdentifier;

            if (!workflowIdentifier || !caseTypeIdentifier) {
                responseArea.innerHTML = `<p class="ct-error-message">Missing workflow or case type identifier.</p>`;
                return;
            }

            // Second API call - Get workflow diagram
            const diagramResponse = await fetch('https://coretax.intranet.pajak.go.id/casemanagement/api/workflowdiagram/view', {
                method: 'POST',
                headers: getHeaders(caseId),
                body: JSON.stringify({
                    "WorkflowIdentifier": workflowIdentifier,
                    "CaseTypeIdentifier": caseTypeIdentifier
                })
            });

            if (!diagramResponse.ok) {
                const errorData = await diagramResponse.json();
                throw new Error(`Workflow Diagram API Error: ${errorData.Message || diagramResponse.statusText}`);
            }

            const diagramData = await diagramResponse.json();

            if (diagramData.IsSuccessful && diagramData.Payload) {
                loadedRoutingForCaseId = caseId;
                renderRoutingInformation(lastPayloadItem, diagramData.Payload);
            } else {
                responseArea.innerHTML = `<p class="ct-error-message">Error: ${diagramData.Message || 'Failed to load workflow diagram'}</p>`;
            }

        } catch (error) {
            handleError(error, responseArea);
        }
    }

    function renderRoutingInformation(routingInfo, diagramData) {
        const responseArea = document.querySelector("#tab-routing .results-container");

        // Parse BPMN diagram to extract workflow steps
        const workflowSteps = parseWorkflowSteps(routingInfo.WorkflowStepList, diagramData.Diagram);

        // Helper function to render dynamic content based on data type
        function renderDynamicContent(data, title) {
            if (!data) return '';
            
            // Helper function to format any value properly
            function formatValue(value) {
                if (value === null || value === undefined) {
                    return '<span style="color: #6b7280; font-style: italic;">N/A</span>';
                } else if (typeof value === 'boolean') {
                    return `<span class="${value ? 'ct-success-text' : 'ct-error-text'}">${value ? 'Yes' : 'No'}</span>`;
                } else if (typeof value === 'object' && value !== null) {
                    if (Array.isArray(value)) {
                        if (value.length === 0) {
                            return '<span style="color: #6b7280; font-style: italic;">Empty array</span>';
                        } else if (value.length <= 3) {
                            return value.map(item => formatValue(item)).join(', ');
                        } else {
                            return `Array (${value.length} items): ${value.slice(0, 2).map(item => formatValue(item)).join(', ')}...`;
                        }
                    } else {
                        // For nested objects, create a mini table
                        const entries = Object.entries(value).filter(([k, v]) => v !== null && v !== undefined);
                        if (entries.length === 0) return '<span style="color: #6b7280; font-style: italic;">Empty object</span>';
                        
                        if (entries.length <= 3) {
                            return `<div style="background: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${entries.map(([k, v]) => `<div><strong>${k}:</strong> ${formatValue(v)}</div>`).join('')}</div>`;
                        } else {
                            return `<div style="background: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-size: 12px;"><div><strong>Object with ${entries.length} properties</strong></div><div>${entries.slice(0, 2).map(([k, v]) => `<strong>${k}:</strong> ${formatValue(v)}`).join(', ')}...</div></div>`;
                        }
                    }
                } else {
                    return String(value);
                }
            }
            
            // Handle arrays
            if (Array.isArray(data)) {
                if (data.length === 0) {
                    return `
                        <div class="routing-section">
                            <h3>${title}</h3>
                            <p class="ct-text-gray-500">Empty array</p>
                        </div>
                    `;
                }
                
                // Check if array contains objects (render as table) or primitives (render as list)
                const firstItem = data[0];
                if (typeof firstItem === 'object' && firstItem !== null) {
                    // Array of objects - render as table
                    const allKeys = new Set();
                    data.forEach(item => {
                        if (typeof item === 'object' && item !== null) {
                            Object.keys(item).forEach(key => allKeys.add(key));
                        }
                    });
                    
                    const headers = Array.from(allKeys);
                    
                    return `
                        <div class="routing-section">
                            <h3>${title} (${data.length} items)</h3>
                            <div class="ct-table-container">
                                <table class="ct-table ct-table--bordered ct-table--sm">
                                    <thead>
                                        <tr>
                                            ${headers.map(header => `<th>${header.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}</th>`).join('')}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${data.map(item => `
                                            <tr>
                                                ${headers.map(header => {
                                                    const value = item[header];
                                                    const formattedValue = formatValue(value);
                                                    return `<td style="vertical-align: top; word-break: break-word;">${formattedValue}</td>`;
                                                }).join('')}
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    `;
                } else {
                    // Array of primitives - render as list
                    return `
                        <div class="routing-section">
                            <h3>${title} (${data.length} items)</h3>
                            <div class="ct-list-container">
                                <ul style="margin: 0; padding-left: 20px;">
                                    ${data.map((item, index) => `<li><strong>${index + 1}:</strong> ${formatValue(item)}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    `;
                }
            }
            
            // Handle objects - use existing renderDynamicTable function
            if (typeof data === 'object' && data !== null) {
                return renderDynamicTable(data, title);
            }
            
            // Handle primitives
            return `
                <div class="routing-section">
                    <h3>${title}</h3>
                    <p>${data}</p>
                </div>
            `;
        }

        // Helper function to render dynamic key-value table from object
        function renderDynamicTable(obj, title) {
            if (!obj || typeof obj !== 'object') return '';
            
            // Helper function to format any value properly
            function formatNestedValue(value) {
                if (value === null || value === undefined) {
                    return '<span style="color: #6b7280; font-style: italic;">N/A</span>';
                } else if (typeof value === 'boolean') {
                    return `<span class="${value ? 'ct-success-text' : 'ct-error-text'}">${value ? 'Yes' : 'No'}</span>`;
                } else if (typeof value === 'object' && value !== null) {
                    if (Array.isArray(value)) {
                        if (value.length === 0) {
                            return '<span style="color: #6b7280; font-style: italic;">Empty array</span>';
                        } else if (value.length === 1) {
                            return formatNestedValue(value[0]);
                        } else {
                            return `<div style="background: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-size: 12px;"><strong>Array (${value.length} items):</strong><br>${value.slice(0, 3).map((item, idx) => `${idx + 1}. ${formatNestedValue(item)}`).join('<br>')}${value.length > 3 ? '<br>...' : ''}</div>`;
                        }
                    } else {
                        // For nested objects, create a formatted display
                        const entries = Object.entries(value).filter(([k, v]) => v !== null && v !== undefined);
                        if (entries.length === 0) return '<span style="color: #6b7280; font-style: italic;">Empty object</span>';
                        
                        return `<div style="background: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-size: 12px;"><strong>Object:</strong><br>${entries.slice(0, 5).map(([k, v]) => `<strong>${k}:</strong> ${typeof v === 'object' && v !== null ? (Array.isArray(v) ? `[Array(${v.length})]` : '[Object]') : v}`).join('<br>')}${entries.length > 5 ? '<br>...' : ''}</div>`;
                    }
                } else {
                    return String(value);
                }
            }
            
            // Flatten nested objects for better display
            function flattenObject(obj, prefix = '') {
                const flattened = {};
                
                for (const [key, value] of Object.entries(obj)) {
                    if (value === null || value === undefined) continue;
                    
                    const newKey = prefix ? `${prefix}.${key}` : key;
                    
                    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                        // For nested objects, check if they're simple (few properties) or complex
                        const entries = Object.entries(value);
                        if (entries.length <= 3) {
                            // Simple nested object - flatten it
                            Object.assign(flattened, flattenObject(value, newKey));
                        } else {
                            // Complex nested object - show as formatted object
                            flattened[newKey] = value;
                        }
                    } else {
                        flattened[newKey] = value;
                    }
                }
                
                return flattened;
            }
            
            const flattenedObj = flattenObject(obj);
            const entries = Object.entries(flattenedObj).filter(([key, value]) => {
                // Filter out null values but keep empty strings and other falsy values
                return value !== null && value !== undefined && value !== 'null';
            });
            
            if (entries.length === 0) return '';
            
            return `
                <div class="routing-section">
                    <h3>${title}</h3>
                    <div class="ct-table-container">
                        <table class="ct-table ct-table--bordered ct-table--sm">
                            <thead>
                                <tr>
                                    <th style="width: 40%;">Property</th>
                                    <th style="width: 60%;">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${entries.map(([key, value]) => {
                                    // Format the key to be more readable
                                    const formattedKey = key
                                        .replace(/\./g, ' → ')  // Replace dots with arrows for nested properties
                                        .replace(/([A-Z])/g, ' $1')  // Add space before capital letters
                                        .replace(/^./, str => str.toUpperCase())  // Capitalize first letter
                                        .trim()
                                        // Handle specific abbreviations
                                        .replace(/T I N/g, 'TIN')
                                        .replace(/N I K/g, 'NIK')
                                        .replace(/K L U/g, 'KLU')
                                        .replace(/U R L/g, 'URL')
                                        .replace(/I D/g, 'ID')
                                        .replace(/A P I/g, 'API');

                                    // Handle different value types
                                    let formattedValue;
                                    if (typeof value === 'boolean') {
                                        formattedValue = `<span class="${value ? 'ct-success-text' : 'ct-error-text'}">${value ? 'Yes' : 'No'}</span>`;
                                    } else if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
                                        formattedValue = formatDateCustom(value);
                                    } else if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
                                        // Format JSON strings with proper indentation
                                        try {
                                            const parsed = JSON.parse(value);
                                            formattedValue = `<pre style="margin: 0; font-size: 12px; background: #f8f9fa; padding: 8px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(parsed, null, 2)}</pre>`;
                                        } catch {
                                            formattedValue = value || 'N/A';
                                        }
                                    } else if (value === 'null' || value === null) {
                                        formattedValue = '<span style="color: #6b7280; font-style: italic;">Not Available</span>';
                                    } else if (value === '' || value === undefined) {
                                        formattedValue = '<span style="color: #6b7280; font-style: italic;">Empty</span>';
                                    } else if (typeof value === 'object' && value !== null) {
                                        // Use the new formatting function for objects
                                        formattedValue = formatNestedValue(value);
                                    } else {
                                        // Handle long text by adding word wrapping
                                        const stringValue = String(value);
                                        if (stringValue.length > 50) {
                                            formattedValue = `<span style="word-break: break-word;">${stringValue}</span>`;
                                        } else {
                                            formattedValue = stringValue;
                                        }
                                    }

                                    return `
                                        <tr>
                                            <td style="vertical-align: top; font-weight: 500;">${formattedKey}</td>
                                            <td style="vertical-align: top; word-break: break-word;">${formattedValue}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        const routingHtml = `
            <div class="routing-info">
                <div class="routing-section">
                    <h3>Current Workflow Status 
                        <span class="section-title-badge ${routingInfo.IsRunning ? 'running' : 'stopped'}">
                            ${routingInfo.IsRunning ? 'Running' : 'Stopped'}
                        </span>
                    </h3>
                    <div class="routing-grid">
                        <div class="routing-item">
                            <label>Current Step:</label>
                            <span class="current-step">${routingInfo.CurrentWorkflowStep || 'N/A'}</span>
                        </div>
                        <div class="routing-item">
                            <label>Workflow Code:</label>
                            <span>${routingInfo.WorkflowCode || 'N/A'}</span>
                        </div>
                        <div class="routing-item">
                            <label>Display Name:</label>
                            <span>${routingInfo.DisplayName || 'N/A'}</span>
                        </div>
                        <div class="routing-item">
                            <label>Can Be Cancelled:</label>
                            <span class="${routingInfo.CanBeCancelledByTaxOfficer ? 'ct-success-text' : 'ct-error-text'}">
                                ${routingInfo.CanBeCancelledByTaxOfficer ? 'Yes' : 'No'}
                            </span>
                        </div>
                        <div class="routing-item">
                            <label>Date Started:</label>
                            <span>${formatDateCustom(routingInfo.DateStarted)}</span>
                        </div>
                    </div>
                </div>

                <div class="routing-section">
                    <h3>Workflow Steps</h3>
                    <div class="workflow-steps">
                        ${workflowSteps.map((step, index) => `
                            <div class="workflow-step ${step.isCurrent ? 'current' : ''} ${step.isCompleted ? 'completed' : ''}">
                                <div class="step-header">
                                    <div class="step-number">${index + 1}</div>
                                    <div class="step-title">${step.CodeName || step.Code || 'Unknown Step'}</div>
                                </div>
                                <div class="step-content">
                                    <div class="step-description">${step.CodeDescription || 'No description available'}</div>
                                    <div class="step-meta">
                                        ${step.IsStartAction ? '<span class="step-tag start">Start</span>' : ''}
                                        ${step.IsFinalAction ? '<span class="step-tag final">Final</span>' : ''}
                                        ${step.IsPortalOnly ? '<span class="step-tag portal">Portal Only</span>' : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                ${routingInfo.Context && routingInfo.Context.GeneralInformation ?
                renderDynamicTable(routingInfo.Context.GeneralInformation, 'General Information') : ''}

                ${routingInfo.Context && routingInfo.Context.Items && routingInfo.Context.Items.length > 0 ? `
                    <div class="routing-section">
                        <h3>Context Information</h3>
                        <div class="context-items">
                            ${routingInfo.Context.Items.map((item, index) => {
                                // Try to parse the value and detect its type
                                let parsedValue;
                                try {
                                    if (typeof item.Value === 'string') {
                                        // Try to parse as JSON
                                        parsedValue = JSON.parse(item.Value);
                                    } else {
                                        // Use the value as-is
                                        parsedValue = item.Value;
                                    }
                                } catch (e) {
                                    // If parsing fails, use the original value
                                    parsedValue = item.Value;
                                }
                                
                                // Determine if this should be displayed as dynamic content or simple key-value
                                if (Array.isArray(parsedValue) || 
                                    (typeof parsedValue === 'object' && parsedValue !== null && Object.keys(parsedValue).length > 1)) {
                                    // Complex data - use dynamic content renderer
                                    return renderDynamicContent(parsedValue, `${item.Key} (Context)`);
                                } else {
                                    // Simple value - display as key-value pair
                                    return `
                                        <div class="context-item">
                                            <label>${item.Key}:</label>
                                            <span>${parsedValue || 'N/A'}</span>
                                        </div>
                                    `;
                                }
                            }).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        responseArea.innerHTML = routingHtml;
    }

    function parseWorkflowSteps(workflowStepList, bpmnDiagram) {
        if (!workflowStepList || !Array.isArray(workflowStepList)) {
            return [];
        }

        // Sort steps by logical order (start actions first, then by code)
        const sortedSteps = [...workflowStepList].sort((a, b) => {
            if (a.IsStartAction && !b.IsStartAction) return -1;
            if (!a.IsStartAction && b.IsStartAction) return 1;
            if (a.IsFinalAction && !b.IsFinalAction) return 1;
            if (!a.IsFinalAction && b.IsFinalAction) return -1;
            return (a.Code || '').localeCompare(b.Code || '');
        });

        return sortedSteps.map(step => ({
            ...step,
            isCurrent: false, // You can enhance this by comparing with current workflow step
            isCompleted: false // You can enhance this by tracking completed steps
        }));
    }



    async function fetchCaseProfile(caseId) {
        const responseArea = document.querySelector("#tab-profile .results-container");
        responseArea.innerHTML = '<p class="ct-loading-message">Loading profile information...</p>';

        try {
            const response = await fetch('https://coretax.intranet.pajak.go.id/casemanagement/api/generalinformation/view', {
                method: 'POST',
                headers: getHeaders(caseId),
                body: JSON.stringify({
                    "AggregateIdentifier": caseId,
                    "LanguageId": "id-ID"
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Profile API Error: ${errorData.Message || response.statusText}`);
            }

            const data = await response.json();

            if (data.IsSuccessful && data.Payload) {
                renderCaseProfile(data.Payload);
            } else {
                responseArea.innerHTML = `<p class="ct-error-message">Error: ${data.Message || 'Failed to load profile information'}</p>`;
            }
        } catch (error) {
            handleError(error, responseArea);
        }
    }

    function renderCaseProfile(profileData) {
        const responseArea = document.querySelector("#tab-profile .results-container");

        const profileHtml = `
            <div class="profile-info">
                <div class="profile-section">
                    <h3>Case Information</h3>
                    <div class="profile-grid">
                        <div class="profile-item">
                            <label>Case Number:</label>
                            <span class="ct-numeric">${profileData.CaseNumber || 'N/A'}</span>
                        </div>
                        <div class="profile-item">
                            <label>Case Type:</label>
                            <span>${profileData.CaseTypeName || 'N/A'}</span>
                        </div>
                        <div class="profile-item">
                            <label>Status:</label>
                            <span>${profileData.Status || 'N/A'}</span>
                        </div>
                        <div class="profile-item">
                            <label>Priority:</label>
                            <span>${profileData.Priority || 'N/A'}</span>
                        </div>
                        <div class="profile-item">
                            <label>Start Date:</label>
                            <span>${formatDateCustom(profileData.StartDate)}</span>
                        </div>
                        <div class="profile-item">
                            <label>Expected Completion:</label>
                            <span>${formatDateCustom(profileData.CompletionExpected)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="profile-section">
                    <h3>Taxpayer Information</h3>
                    <div class="profile-grid">
                        <div class="profile-item">
                            <label>Name:</label>
                            <span>${profileData.MainTaxpayerName || 'N/A'}</span>
                        </div>
                        <div class="profile-item">
                            <label>${t('tin')}:</label>
                            <span class="ct-numeric">${profileData.MainTaxpayerTin || t('na')}</span>
                        </div>
                        <div class="profile-item">
                            <label>Registration Date:</label>
                            <span>${formatDateCustom(profileData.RegistrationDate)}</span>
                        </div>
                        <div class="profile-item">
                            <label>Email:</label>
                            <span>${profileData.EmailAddress || 'N/A'}</span>
                        </div>
                        <div class="profile-item">
                            <label>Phone:</label>
                            <span class="ct-numeric">${profileData.TelephoneNumber || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="profile-section">
                    <h3>Tax Office Information</h3>
                    <div class="profile-grid">
                        <div class="profile-item">
                            <label>Tax Region:</label>
                            <span>${profileData.TaxRegion || 'N/A'}</span>
                        </div>
                        <div class="profile-item">
                            <label>Tax Office:</label>
                            <span>${profileData.TaxOffice || 'N/A'}</span>
                        </div>
                        <div class="profile-item">
                            <label>Office Address:</label>
                            <span>${profileData.TaxOfficeAddress || 'N/A'}</span>
                        </div>
                        <div class="profile-item">
                            <label>Office Phone:</label>
                            <span class="ct-numeric">${profileData.TaxOfficePhoneNumber || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="profile-section">
                    <h3>Additional Details</h3>
                    <div class="profile-grid">
                        <div class="profile-item">
                            <label>Description:</label>
                            <span>${profileData.Description || 'N/A'}</span>
                        </div>
                        <div class="profile-item">
                            <label>Business Classification:</label>
                            <span>${profileData.BusinessClassification || 'N/A'}</span>
                        </div>
                        <div class="profile-item">
                            <label>Tax Period:</label>
                            <span>${profileData.TaxPeriod || 'N/A'}</span>
                        </div>
                        <div class="profile-item">
                            <label>Tax Year:</label>
                            <span>${profileData.TaxYear || 'N/A'}</span>
                        </div>
                        <div class="profile-item">
                            <label>Last Modified:</label>
                            <span>${formatDateCustom(profileData.LastModified)}</span>
                        </div>
                        <div class="profile-item">
                            <label>Created By:</label>
                            <span>${profileData.CreatedBy || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        responseArea.innerHTML = profileHtml;
    }

    // --- HELPER FUNCTIONS ---
    function getHeaders(caseId = null) { const authToken = getAuthToken(), requestFromUrl = caseId ? `https://coretax.intranet.pajak.go.id/case-management/id-ID/case-overview/${caseId}` : window.location.href; return { accept: "application/json, text/plain, */*", authorization: `Bearer ${authToken}`, "content-type": "application/json", languageid: "id-ID", request_from: requestFromUrl } }
    function populateFilter(selectId, data, key) {
        const select = document.getElementById(selectId);
        if (!select) return;

        // Handle both array of strings and array of objects
        let values;
        if (Array.isArray(data) && data.length > 0) {
            if (typeof data[0] === 'string') {
                // Legacy format: array of strings
                values = [...new Set(data.filter(Boolean))];
            } else if (typeof data[0] === 'object' && data[0][key]) {
                // New format: array of objects
                values = [...new Set(data.map(e => e[key]).filter(Boolean))];
            } else {
                // Fallback: extract from data using key
                values = [...new Set(data.map(e => e[key]).filter(Boolean))];
            }
        } else {
            // Fallback: extract from data using key
            values = [...new Set(data.map(e => e[key]).filter(Boolean))];
        }

        select.innerHTML = `<option value="all">${t('show_all')}</option>`;
        values.sort().forEach(e => {
            // Create translation key by converting to lowercase and replacing spaces with underscores
            const translationKey = e.toLowerCase().replace(/\s+/g, '_');
            const translatedText = t(translationKey) || e; // Fallback to original if no translation
            select.innerHTML += `<option value="${e}">${translatedText}</option>`;
        });
    }
    function populateBooleanFilter(selectId) {
        const e = document.getElementById(selectId);
        if (e) {
            e.innerHTML = `
                <option value="all">${t('show_all')}</option>
                <option value="true">${t('yes')}</option>
                <option value="false">${t('no')}</option>
            `;
        }
    }
    function getAuthToken() {
        const userDataString = localStorage.getItem(AUTH_STORAGE_KEY);
        const userData = userDataString ? JSON.parse(userDataString) : null;
        const authToken = userData?.access_token;
        if (!authToken) throw new Error("Authorization Token not found.");
        return authToken
    }
    function getUserProfile() { const userDataString = localStorage.getItem(AUTH_STORAGE_KEY), userData = userDataString ? JSON.parse(userDataString) : null; return userData?.profile || null }
    function loadUserProfile() {
        try {
            const profile = getUserProfile();
            const nameElement = document.getElementById('ct-profile-name');
            const emailElement = document.getElementById('ct-profile-email');

            if (profile && nameElement && emailElement) {
                nameElement.textContent = profile.full_name || 'Unknown User';
                emailElement.textContent = profile.email || 'No email available';
            } else {
                if (nameElement) nameElement.textContent = 'Profile not available';
                if (emailElement) emailElement.textContent = t('please_reload');
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
            const nameElement = document.getElementById('ct-profile-name');
            const emailElement = document.getElementById('ct-profile-email');
            if (nameElement) nameElement.textContent = 'Error loading profile';
            if (emailElement) emailElement.textContent = t('please_reload');
        }
    }
    function createTable(headers) {
        const table = document.createElement("table");
        table.className = "ct-results-table";
        const thead = document.createElement("thead");

        // Translate headers
        const translatedHeaders = headers.map(header => {
            const key = header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, '');
            return t(key, header);
        });

        thead.innerHTML = `<tr>${translatedHeaders.map(h => `<th>${h}</th>`).join("")}</tr>`;
        table.appendChild(thead);
        return table;
    }
    function handleError(error, area) {
        console.error("Userscript Error:", error); let errorHtml; error.message.includes("Authorization Token not found") ? errorHtml = `
            <div class="ct-error-container">
                <h3>Authentication Error</h3>
                <p class="ct-error-subtitle">Please reload the page to log in again.</p>
                <button id="auth-reload-btn" class="ct-btn ct-btn--sm ct-btn--primary">Reload Page</button>
            </div>`: errorHtml = `<p class="ct-error-message"><b>An error occurred:</b><br>${error.message}</p>`, area.innerHTML = errorHtml; const reloadBtn = area.querySelector("#auth-reload-btn"); reloadBtn && reloadBtn.addEventListener("click", () => window.location.reload())
    }
    function generateInitial(name) { if (!name || name.trim() === "" || name === "N/A") return ""; const words = name.trim().split(/\s+/); return 1 === words.length ? words[0].substring(0, 3).toUpperCase() : words.map(word => word.charAt(0)).join("").toUpperCase() }
    function updateHeader(caseObject) {
        const titleTextEl = document.getElementById("ct-header-title-text");
        const subtitleEl = document.getElementById("ct-header-subtitle");
        const initialEl = document.getElementById("ct-header-initial");
        const actionsContainer = document.getElementById("ct-header-actions");

        while (actionsContainer.firstChild) {
            actionsContainer.removeChild(actionsContainer.firstChild);
        }

        if (caseObject) {
            titleTextEl.textContent = caseObject.MainTaxpayerName || "N/A";
            subtitleEl.textContent = caseObject.CaseNumber || "N/A";
            initialEl.textContent = generateInitial(caseObject.MainTaxpayerName);

            const caseId = caseObject.AggregateIdentifier;
            const hasValidId = caseId && typeof caseId === "string" && caseId.trim() !== "";

            const openBtn = document.createElement("a");
            openBtn.href = `https://coretax.intranet.pajak.go.id/case-management/id-ID/case-overview/${caseId}`;
            openBtn.className = "action-btn open-case";
            openBtn.textContent = t('open');
            if (!hasValidId) openBtn.disabled = true;



            actionsContainer.append(openBtn);

            if (caseObject.CaseTypeName === REFUND_CASE_TYPE_NAME) {
                const refundBtn = document.createElement("button");
                refundBtn.className = "action-btn review-refund-case";
                refundBtn.textContent = t('refund_review');
                actionsContainer.appendChild(refundBtn);
                refundBtn.addEventListener("click", () => startRefundReviewProcess(caseId, refundBtn));
            }
        } else {
            titleTextEl.textContent = "No Case Selected";
            subtitleEl.textContent = 'Please select a case from the "My Cases" tab';
            initialEl.textContent = "";
        }
    }
    async function startRefundReviewProcess(caseId, button) { const originalText = button.textContent; button.textContent = "...", button.disabled = !0; const responseArea = document.querySelector("#tab-refund .results-container"); try { switchTab("tab-refund"), responseArea.innerHTML = '<p class="ct-loading-message">Step 1/3: Fetching Sub Process ID...</p>'; if (!caseId) throw new Error("A case must be selected."); const subProcessId = await fetchSubProcessId(caseId); responseArea.innerHTML = '<p class="ct-loading-message">Step 2/3: Fetching reference number...</p>'; const referenceNumber = await fetchC02FormDetail(caseId, subProcessId); responseArea.innerHTML = '<p class="ct-loading-message">Step 3/3: Fetching refund details...</p>', await fetchRefundReview(caseId, referenceNumber) } catch (error) { handleError(error, responseArea) } finally { button.textContent = originalText, button.disabled = !1 } }

    function handleCaseSelection(event) {
        if (event.target.closest('.group-header')) return;

        // Exclude clicks on the Open button (anchor tags with open-case class)
        if (event.target.closest('.open-case')) return;

        const row = event.target.closest('tr[data-id]');
        if (!row) return;
        const caseId = row.dataset.id;
        if (!caseId) return;

        // Update selected state in My Cases table
        document.querySelectorAll('#tab-my-cases tbody tr').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');

        // Find case data and navigate to case details
        const caseData = allMyCases.find(c => c.AggregateIdentifier === caseId);
        if (caseData) {
            navigateToCaseDetails(caseData);
            // Save state after case selection
            setTimeout(saveSidebarState, 50);
        }
    }
    function handleDocumentAction(event) {
        const target = event.target.closest(".ct-btn");  // ✅ Correct class!
        if (target && target.matches(".download-doc")) {
            downloadDocument(target.dataset.docId, target.dataset.filename, target);
        } else if (target && target.matches(".print-doc")) {
            printDocument(target.dataset.docId, target.dataset.filename, target);
        }
    }
    function handleGroupToggle(event) { const headerRow = event.target.closest(".group-header"); if (!headerRow) return; const groupId = headerRow.dataset.groupId; if (!groupId) return; headerRow.classList.toggle("collapsed"), headerRow.classList.toggle("expanded"); const isCollapsed = headerRow.classList.contains("collapsed"), tableBody = headerRow.parentElement, memberRows = tableBody.querySelectorAll(`.group-member.${groupId}`); memberRows.forEach(e => { e.style.display = isCollapsed ? "none" : "table-row" }) }
    function switchTab(tabId) {
        // Switch tabs in the case details screen
        const tabs = document.querySelectorAll("#ct-case-details-screen .ct-tab-button");
        const panels = document.querySelectorAll("#ct-case-details-screen .ct-tab-panel");

        tabs.forEach(e => e.classList.remove("active"));
        panels.forEach(e => e.classList.remove("active"));

        const targetButton = document.querySelector(`#ct-case-details-screen [data-tab="${tabId}"]`);
        const targetPanel = document.querySelector(`#ct-case-details-screen #${tabId}`);

        if (targetButton) targetButton.classList.add("active");
        if (targetPanel) targetPanel.classList.add("active");

        if (tabId === "tab-profile" && selectedCaseId && selectedCaseId !== loadedProfileForCaseId) {
            fetchCaseProfile(selectedCaseId);
            loadedProfileForCaseId = selectedCaseId;
        } else if (tabId === "tab-docs" && selectedCaseId && selectedCaseId !== loadedDocsForCaseId) {
            fetchCaseDocuments(selectedCaseId);
        } else if (tabId === "tab-users" && selectedCaseId && selectedCaseId !== loadedUsersForCaseId) {
            fetchCaseUsers(selectedCaseId);
        } else if (tabId === 'tab-routing' && selectedCaseId && loadedRoutingForCaseId !== selectedCaseId) {
            loadedRoutingForCaseId = selectedCaseId;
            fetchCaseRouting(selectedCaseId);
        }
    }
    function downloadRefundExcel() {
        if (!filteredRefundData || filteredRefundData.length === 0) {
            alert("No data to download. Please filter the data first.");
            return;
        }
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const datetimeSuffix = `${year}${month}${day}_${hours}${minutes}`;
        let filenamePrefix = 'Refund_Review_Data';
        if (selectedCaseId) {
            const selectedCase = allMyCases.find(c => c.AggregateIdentifier === selectedCaseId);
            if (selectedCase && selectedCase.CaseNumber) {
                const sanitizedCaseNumber = selectedCase.CaseNumber.replace(/[\\/:"*?<>|]/g, '_');
                filenamePrefix = `Refund_Review_Data_${sanitizedCaseNumber}`;
            }
        }
        const filename = `${filenamePrefix}_${datetimeSuffix}.xlsx`;
        const headerMapping = [
            { apiField: "ReportedBySeller", excelHeader: "Telah dilaporkan oleh Penjual?" }, { apiField: "Tin", excelHeader: "NPWP Penjual" }, { apiField: "Name", excelHeader: "Nama Penjual" }, { apiField: "DocumentNumber", excelHeader: "Nomor Faktur Pajak/Dokumen yang Dipersamakan/Nota Retur/Nota Pembatalan" }, { apiField: "DocumentDate", excelHeader: "Tanggal Faktur Pajak/Dokumen yang Dipersamakan/Nota Retur/Nota Pembatalan" }, { apiField: "TransactionCode", excelHeader: "Kode Transaksi" }, { apiField: "SellingPrice", excelHeader: "Harga Jual/Dasar Pengenaan Pajak/Dasar Pengenaan Pajak Lainnya (Rp)" }, { apiField: "VatPaid", excelHeader: "PPN yang dikreditkan pada SPT yang Dilaporkan" }, { apiField: "StlgPaid", excelHeader: "PPnBM yang dikreditkan pada SPT yang Dilaporkan" }
        ];
        const excelData = filteredRefundData.map(item => {
            const row = {};
            headerMapping.forEach(map => {
                if (map.apiField === 'ReportedBySeller') {
                    row[map.excelHeader] = item[map.apiField] ? 'Yes' : 'No';
                } else {
                    row[map.excelHeader] = item[map.apiField] === null ? '' : item[map.apiField];
                }
            });
            return row;
        });
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Refund Review");
        XLSX.writeFile(workbook, filename);
    }

    // --- SIDEBAR STATE PERSISTENCE ---
    function saveSidebarState() {
        const sidebar = document.getElementById('ct-sidebar');
        const isOpen = sidebar && sidebar.classList.contains('open');
        
        const state = {
            isOpen: isOpen,
            selectedCaseId: selectedCaseId,
            currentScreen: currentScreen,
            activeTab: document.querySelector('.ct-tab-button.active')?.dataset.tab || 'tab-profile',
            timestamp: Date.now()
        };
        
        localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(state));
    }

    function restoreSidebarState() {
        try {
            const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
            if (!savedState) return false;
            
            const state = JSON.parse(savedState);
            
            // Check if state is recent (within 24 hours)
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            if (Date.now() - state.timestamp > maxAge) {
                localStorage.removeItem(SIDEBAR_STATE_KEY);
                return false;
            }
            
            // Restore sidebar open state
            const sidebar = document.getElementById('ct-sidebar');
            if (sidebar && state.isOpen) {
                sidebar.classList.add('open');
            }
            
            // Restore selected case and screen
            if (state.selectedCaseId) {
                selectedCaseId = state.selectedCaseId;
                currentScreen = state.currentScreen || 'case-details';
            }
            
            // Restore active tab
            if (state.activeTab) {
                setTimeout(() => {
                    switchTab(state.activeTab);
                }, 100);
            }
            
            return true;
        } catch (error) {
            console.warn('Failed to restore sidebar state:', error);
            localStorage.removeItem(SIDEBAR_STATE_KEY);
            return false;
        }
    }

    function setupPersistenceListeners() {
        // Save state when sidebar is toggled
        const originalToggle = document.getElementById('ct-sidebar-toggle');
        if (originalToggle) {
            originalToggle.addEventListener('click', () => {
                // Use setTimeout to ensure the class change has been applied
                setTimeout(saveSidebarState, 50);
            });
        }
        
        // Save state on keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'b') {
                setTimeout(saveSidebarState, 50);
            }
        });
        
        // Save state when tabs are switched
        document.getElementById('ct-tab-bar').addEventListener('click', (e) => {
            if (e.target.matches('.ct-tab-button')) {
                setTimeout(saveSidebarState, 50);
            }
        });
        
        // Save state before page unload
        window.addEventListener('beforeunload', saveSidebarState);
        
        // Save state on visibility change (when tab becomes hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                saveSidebarState();
            }
        });
        
        // Periodic state saving (every 30 seconds)
        setInterval(saveSidebarState, 30000);
    }



    function toggleAllGroups(containerSelector, button) {
        const isCollapsing = button.textContent === t('collapse_all');
        const headers = document.querySelectorAll(`${containerSelector} .group-header`);
        const members = document.querySelectorAll(`${containerSelector} .group-member`);

        headers.forEach(header => {
            if (isCollapsing) {
                header.classList.remove('expanded');
                header.classList.add('collapsed');
            } else {
                header.classList.remove('collapsed');
                header.classList.add('expanded');
            }
        });

        members.forEach(member => {
            member.style.display = isCollapsing ? 'none' : 'table-row';
        });

        button.textContent = isCollapsing ? t('expand_all') : t('collapse_all');
    }

    // --- MAIN INITIALIZATION ---
    function main() {
        // Initialize language system
        currentLanguage = detectLanguage();

        addStyles();
        createSidebar();
        loadUserProfile();

        // Add language buttons to profile section
        const profileSection = document.getElementById('ct-profile-section');
        const languageContainer = document.getElementById('ct-language-switcher-container');
        if (profileSection && languageContainer) {
            const languageButtons = createLanguageButtons();
            languageContainer.appendChild(languageButtons);
        }

        // Populate filter dropdowns
        populateFilter("cases-status-filter", [{ status: "In Progress" }, { status: "Completed" }, { status: "Cancelled" }], "status");
        populateFilter("docs-status-filter", [{ status: "Draft" }, { status: "Submitted" }, { status: "Approved" }, { status: "Rejected" }], "status");
        populateFilter("users-role-filter", [{ role: "Taxpayer" }, { role: "Tax Officer" }, { role: "Supervisor" }], "role");
        populateBooleanFilter("refund-reported-filter");

        document.getElementById('ct-sidebar-toggle').addEventListener('click', () => {
            document.getElementById('ct-sidebar').classList.toggle('open');
        });

        // Add keyboard shortcut to toggle sidebar (Ctrl+B)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                document.getElementById('ct-sidebar').classList.toggle('open');
            }
        });
        document.getElementById('ct-tab-bar').addEventListener('click', (e) => {
            if (e.target.matches('.ct-tab-button')) switchTab(e.target.dataset.tab);
        });
        document.getElementById('ct-nav-back-btn').addEventListener('click', navigateBackToCases);
        document.getElementById('reload-profile-btn').addEventListener('click', () => {
            if (selectedCaseId) {
                loadedProfileForCaseId = null;
                fetchCaseProfile(selectedCaseId);
            }
        });
        document.getElementById('reload-docs-btn').addEventListener('click', () => {
            if (selectedCaseId) {
                loadedDocsForCaseId = null;
                fetchCaseDocuments(selectedCaseId);
            }
        });



        document.getElementById('reload-users-btn').addEventListener('click', () => {
            if (selectedCaseId) {
                loadedUsersForCaseId = null;
                fetchCaseUsers(selectedCaseId);
            }
        });
        document.getElementById('reload-refund-btn').addEventListener('click', () => {
            if (selectedCaseId) {
                const reloadBtn = document.getElementById('reload-refund-btn');
                startRefundReviewProcess(selectedCaseId, reloadBtn);
            }
        });
        document.getElementById('reload-routing-btn').addEventListener('click', () => {
            if (selectedCaseId) {
                loadedRoutingForCaseId = null;
                fetchCaseRouting(selectedCaseId);
            }
        });

        // Set initial active tab to profile
        switchTab('tab-profile');
        document.getElementById('cases-status-filter').addEventListener('change', renderMyCasesTable);
        document.getElementById('docs-status-filter').addEventListener('change', renderCaseDocumentsTable);
        document.getElementById('users-role-filter').addEventListener('change', renderCaseUsersTable);
        document.getElementById('refund-reported-filter').addEventListener('change', renderRefundReviewTable);
        document.getElementById('refund-download-btn').addEventListener('click', downloadRefundExcel);

        document.getElementById('toggle-cases-btn').addEventListener('click', (e) => toggleAllGroups('#tab-my-cases .results-container', e.target));
        document.getElementById('toggle-docs-btn').addEventListener('click', (e) => toggleAllGroups('#tab-docs .results-container', e.target));
        document.getElementById('toggle-users-btn').addEventListener('click', (e) => toggleAllGroups('#tab-users .results-container', e.target));
        document.getElementById('toggle-refund-btn').addEventListener('click', (e) => toggleAllGroups('#tab-refund .results-container', e.target));

        // Add event delegation for action buttons
        document.addEventListener('click', function (event) {
            const actionBtn = event.target.closest('.ct-btn');
            if (!actionBtn) return;

            const caseId = actionBtn.dataset.id;
            if (!caseId) return;

            const caseData = allMyCases.find(c => c.AggregateIdentifier === caseId);
            if (!caseData) return;

            if (actionBtn.classList.contains('view-docs')) {
                navigateToCaseDetails(caseData);
                switchTab('tab-docs');
            } else if (actionBtn.classList.contains('view-users')) {
                navigateToCaseDetails(caseData);
                switchTab('tab-users');
            } else if (actionBtn.classList.contains('review-refund-case')) {
                navigateToCaseDetails(caseData);
                switchTab('tab-refund');
                startRefundReviewProcess(caseId, actionBtn);
            }
        });

        // Setup persistence after all event listeners are attached
        setupPersistenceListeners();
        
        // Restore sidebar state after a short delay to ensure DOM is ready
        setTimeout(() => {
            const restored = restoreSidebarState();
            if (restored && selectedCaseId) {
                // If we restored a case selection, fetch the case data and update UI
                fetchMyCases().then(() => {
                    const caseData = allMyCases.find(c => c.AggregateIdentifier === selectedCaseId);
                    if (caseData) {
                        navigateToCaseDetails(caseData);
                    }
                });
            } else {
                fetchMyCases();
            }
        }, 200);

        // Update UI language after everything is set up
        updateUILanguage();
    }

    main();
})();