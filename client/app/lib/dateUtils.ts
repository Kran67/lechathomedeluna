export type DateInput = Date | string | number;

export interface DifferenceResult {
    text: string;
    y: number;
    m: number;
    d: number;
    h: number;
    i: number;
    s: number;
    invert: 0 | 1;
    text_invert: "il y a" | "Dans";
    days: number;
}

export class DateUtils {

    private static toDate(input: DateInput): Date {
        if (input instanceof Date) return new Date(input.getTime());

        if (typeof input === "number") {
            // auto-detect seconds vs milliseconds
            return input < 10_000_000_000
                ? new Date(input * 1000)
                : new Date(input);
        }

        return new Date(input);
    }

    static differenceDate(firstDate: DateInput, lastDate?: DateInput): DifferenceResult {

        const date1 = this.toDate(firstDate);
        const date2 = lastDate ? this.toDate(lastDate) : new Date();

        const invert: 0 | 1 = date1 > date2 ? 0 : 1;

        const start = invert ? date1 : date2;
        const end = invert ? date2 : date1;

        let y = end.getFullYear() - start.getFullYear();
        let m = end.getMonth() - start.getMonth();
        let d = end.getDate() - start.getDate();
        let h = end.getHours() - start.getHours();
        let i = end.getMinutes() - start.getMinutes();
        let s = end.getSeconds() - start.getSeconds();

        if (s < 0) { s += 60; i--; }
        if (i < 0) { i += 60; h--; }
        if (h < 0) { h += 24; d--; }

        if (d < 0) {
            const previousMonth = new Date(end.getFullYear(), end.getMonth(), 0);
            d += previousMonth.getDate();
            m--;
        }

        if (m < 0) {
            m += 12;
            y--;
        }

        const days = Math.floor(
            Math.abs(date2.getTime() - date1.getTime()) / 86400000
        );

        const text_invert: "il y a" | "Dans" =
            invert === (lastDate ? 0 : 1) ? "il y a" : "Dans";

        let text: string;

        if (y > 0) {
            text = `${text_invert} ${y} an${y > 1 ? "s" : ""}${d > 0 ? ` et ${d} jour${d > 1 ? "s" : ""}` : ""}`;
        } else if (m > 0) {
            text = `${text_invert} ${m} mois${d > 0 ? ` et ${d} jour${d > 1 ? "s" : ""}` : ""}`;
        } else if (d > 0) {
            text = `${text_invert} ${d} jour${d > 1 ? "s" : ""}`;
        } else if (h > 0) {
            text = `${text_invert} ${h} heure${h > 1 ? "s" : ""}`;
        } else if (i > 0) {
            text = `${text_invert} ${i} minute${i > 1 ? "s" : ""}`;
        } else if (s > 0) {
            text = `${text_invert} ${s} seconde${s > 1 ? "s" : ""}`;
        } else {
            text = "Depuis aujourd'hui!";
        }

        return {
            text,
            y,
            m,
            d,
            h,
            i,
            s,
            invert,
            text_invert,
            days
        };
    }
}
