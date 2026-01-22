export const homeStyles = {
    container: "flex-1 flex-row bg-white",
    scrollView: "flex-1 h-full",
    contentContainer: "flex-col px-6 py-10",
    headerTitle: "text-xl font-bold text-emerald-800 text-center mb-6 w-full mt-4",
    gridContainer: "flex-row flex-wrap justify-center w-full mb-12 gap-10",
    sidebarContainer: "w-64 h-full flex-col items-start justify-end gap-4 px-6 pb-6 border-r border-slate-100 bg-white",
};

export const actionButtonStyle = {
    base: "flex-row items-center gap-3 px-6 py-4 rounded-xl w-full justify-start border",
    labelText: "font-semibold text-base",

    // Variants
    primaryContainer: "bg-indigo-600 border-transparent active:bg-indigo-700",
    primaryText: "text-white",

    secondaryContainer: "bg-slate-100 border-transparent active:bg-slate-200",
    secondaryText: "text-slate-700",

    dangerContainer: "bg-white border-transparent active:bg-red-50",
    dangerText: "text-red-500",

    disabledContainer: "bg-slate-100 border-transparent opacity-50",
    disabledText: "text-slate-400",
};