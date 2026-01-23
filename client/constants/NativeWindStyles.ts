// ---------- Common styles ----------
export const common = {
    page: "flex-1 bg-white",
    card: "bg-white p-4 rounded-xl shadow-sm border border-slate-100",
    rowCenter: "flex-row items-center",
    colStart: "flex-col items-start",
    textHeader: "font-bold text-slate-900",
    textSub: "text-slate-500 text-base",
};


// ---------- Component styles ----------
export const actionButtonStyle = {
    base: `${common.rowCenter} gap-3 px-6 py-4 rounded-xl w-full justify-start border`,
    iconContainer: "w-6 items-center justify-center",
    labelText: "font-semibold text-base",

    // Variants
    primaryContainer: "bg-indigo-600 border-transparent active:bg-indigo-700",
    primaryText: "text-white",
    primaryIcon: "text-white",

    secondaryContainer: "bg-slate-100 border-slate-200 active:bg-slate-200",
    secondaryText: "text-slate-700",
    secondaryIcon: "text-slate-700",

    dangerContainer: "bg-white border-red-200 active:bg-red-50",
    dangerText: "text-red-500",
    dangerIcon: "text-red-500",

    disabledContainer: "bg-slate-100 border-transparent opacity-50",
    disabledText: "text-slate-400",
    disabledIcon: "text-slate-400",
};

export const selectBoxStyles = {
    container: "mb-5 w-full",
    label: "text-sm font-semibold text-slate-700 mb-2",
    pickerBase: `${common.rowCenter} px-4 py-3.5 border rounded-xl`,
    pickerActive: "bg-white border-slate-300",
    pickerDisabled: "bg-slate-100 border-slate-200",
    textBase: "flex-1",
    textActive: "text-slate-900",
    textDisabled: "text-slate-400",
    modalOverlay: "flex-1 bg-black/50 justify-end",
    modalContent: "bg-white rounded-t-2xl p-4 max-h-[70%]",
    modalTitle: `${common.textHeader} text-lg mb-4`,
    optionItem: "py-3 px-4 border-b border-slate-100 active:bg-slate-50",
    optionTextSelected: "font-bold text-indigo-600",
    optionTextNormal: "text-slate-900",
    cancelButton: "mt-4 py-3 px-4 bg-slate-100 rounded-xl",
    cancelText: "text-center font-semibold text-slate-700",
};

export const buildingCardStyles = {
    card: `${common.card} rounded-2xl items-center w-80`,
    imageContainer: "w-20 h-20 rounded-full mb-3 items-center justify-center overflow-hidden",
    imagePlaceholder: "w-full h-full bg-black/5",
    name: `${common.textHeader} text-center mb-1 text-base`,
    location: `${common.textSub} text-xs text-center mb-4`,
    button: "bg-indigo-600 w-full py-2.5 rounded-lg items-center active:bg-indigo-700",
    buttonText: "text-white font-semibold text-sm",
};


// ---------- Page styles ----------
export const homeStyles = {
    container: `${common.page} flex-row`,
    scrollView: "flex-1 h-full",
    contentContainer: "flex-col px-6 py-10",
    headerTitle: "text-xl font-bold text-emerald-800 text-center mb-6 w-full mt-4", // Distinct from search header
    gridContainer: "flex-row flex-wrap justify-center w-full mb-12 gap-10",
    sidebarContainer: `w-64 h-full ${common.colStart} justify-end gap-4 px-6 pb-6 border-r border-slate-100 bg-white`,
};

export const searchStyles = {
    pageContainer: common.page,
    wizardScroll: "flex-1 w-full",
    wizardContent: "max-w-lg mx-auto w-full",
    headerContainer: "mb-8",
    headerTitle: `${common.textHeader} text-2xl mb-2`,
    headerSubtitle: `${common.textSub} leading-relaxed`,
    formContainer: "flex-1",
    continueButtonBase: `${common.rowCenter} w-full py-4 rounded-xl font-bold text-lg shadow-sm mt-8 justify-center gap-2`,
    continueButtonActive: "bg-indigo-600 active:bg-indigo-700",
    continueButtonDisabled: "bg-slate-200",
    continueTextBase: "text-lg font-bold",
    continueTextActive: "text-white",
    continueTextDisabled: "text-slate-400",
};

export const buildingSearchStyles = {
    container: "flex-1 flex flex-col",
    contextHeader: "bg-indigo-50 px-4 py-3 border-b border-indigo-100 flex-row justify-between items-center",
    contextTextContainer: `${common.rowCenter}`,
    contextText: "text-indigo-900 text-sm font-medium",
    changeText: "text-xs text-indigo-600 font-semibold underline",
    searchContainer: "p-4 bg-white border-b border-slate-100 z-10 shadow-sm flex-row items-center",
    searchInput: "flex-1 ml-3 py-3 text-sm bg-white text-slate-900",
    resultsScroll: "flex-1 p-4 bg-slate-50",
    resultsHeader: "mb-4 flex flex-row justify-between items-center",
    resultsTitle: "text-sm font-semibold text-slate-500 uppercase tracking-wider",
    resultsCountContainer: "bg-white border border-slate-200 px-2 py-1 rounded-md shadow-sm",
    resultsCountText: "text-xs text-slate-400 font-medium",
    listContainer: "gap-3 pb-8",
    cardContainer: `${common.card} gap-4 active:bg-slate-50 flex-row items-center`, // Extended generic card
    cardImagePlaceholder: "w-14 h-14 rounded-lg flex items-center justify-center shrink-0",
    cardContent: "flex-1 min-w-0",
    cardRow: "flex-row items-center gap-1 mb-0.5",
    cardTitle: `${common.textHeader} truncate flex-1`,
    cardMetaRow: "flex-row items-center text-slate-500 text-xs mb-1",
    cardMetaText: "text-slate-500 text-xs ml-1",
    emptyStateContainer: "py-12 flex flex-col items-center",
    emptyStateIcon: "w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4",
    emptyStateTitle: `${common.textHeader} font-medium mb-1`,
    emptyStateDescription: "text-slate-500 text-sm max-w-[220px] text-center leading-relaxed",
    // createLink: "mt-6",
    // createLinkText: "text-indigo-600 font-semibold text-sm underline",
};
