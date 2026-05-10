const KEY = 'wageConfig';
const DEFAULTS = { kooliRate: 800, grassCutterRate: 250 };

export const getWageConfig = () => {
    try {
        const stored = localStorage.getItem(KEY);
        return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : { ...DEFAULTS };
    } catch {
        return { ...DEFAULTS };
    }
};

export const saveWageConfig = (config) => {
    localStorage.setItem(KEY, JSON.stringify(config));
};
