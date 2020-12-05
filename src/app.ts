import dayjs, { Dayjs } from "dayjs";
import utcPlugin from "dayjs/plugin/utc";

dayjs.extend(utcPlugin);

interface DisplayTime {
    hours: number,
    minutes: number
}

const getPushShiftData = async (type: string): Promise<DisplayTime> => {
    const url = `https://api.pushshift.io/reddit/${ type }/search?limit=1`;
    const res: Response = await fetch(url);
    if (!res.ok) throw new Error("PushShift failed to response with a 200 OK status code");

    const data: any = (await res.json()).data;
    return getTimeDiffFromNow(<number>data[0].created_utc);
};

const getTimeDiffFromNow = (redditUtc: number): DisplayTime => {
    const currentTime: Dayjs = dayjs.utc();
    const redditTime: Dayjs = dayjs.unix(redditUtc);

    const hours = currentTime.diff(redditTime, "h");
    const minutes = currentTime.diff(redditTime, "m") - (hours * 60);
    return { hours, minutes };
};

const handleRefresh = (button: HTMLButtonElement, type: string): void => {
    if (type !== "comment" && type != "submission") {
        throw new Error("handleRefresh must have argument `type` equal to 'comment' or 'submission'");
    }
    updateTime(type);
};

const updateTime = (type: string): void => {
    const content: HTMLElement = <HTMLElement>document.querySelector(`[data-content=${ type }]`);
    const button: HTMLButtonElement = <HTMLButtonElement>content.nextElementSibling;

    button.disabled = true;
    content.innerText = "Refreshing data...";

    getPushShiftData(type).then((time: DisplayTime) => {
        button.disabled = false;
        content.innerText = `${ time.hours } hours, ${ time.minutes } minutes ago`;
    }).catch(err => {
        button.disabled = false;
        content.innerText = "Failed to retrieve, please try again.";
        console.error(err);
    });
};

const refreshButtons: NodeListOf<HTMLButtonElement> = document.querySelectorAll("[data-refresh]");

refreshButtons.forEach((button: HTMLButtonElement) => {
    button.addEventListener("click", ({ target }) => {
        if (target != null && target instanceof HTMLElement) {
            handleRefresh(button, (<HTMLElement>target).dataset.refreshType);
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    updateTime("comment");
    updateTime("submission");
});
