import { ipcRenderer } from "electron";
import { match, when } from "ts-pattern";
import { Events } from "./events";

const isBuildPage = (value: string) => {
  const result = /\/job\/aws-inspector\/job\/(.*)-assessment-template\/build$/.test(value);
  console.log(`${value}, ${result}`)
  return result;
}
const isInstanceJobPage = (value: string) => {
  const result = /\/job\/aws-inspector\/job\/(.*)-assessment-template\/$/.test(value);
  console.log(`${value}, ${result}`)
  return result;
}
const isInstanceListPage = (value: string) => {
  const result = /\/job\/aws-inspector\/$/.test(value);
  console.log(`${value}, ${result}`)
  return result;
}

window.addEventListener("load", () => {

  ipcRenderer.on(Events.RUN_JOB, async (event, args) => {
    console.log(`running job ${args}`);
    window.location.assign(`https://some.domain/job/aws-inspector/${args}`)
  });

  match<string>(window.location.pathname)
    .with(when(isBuildPage), () => {
      setTimeout(() => {
        const overwriteSchedule = document.querySelector('#main-panel > form > div.parameters > div.tr.form-group > div.setting-main.help-sibling > div > input:nth-child(2)') as HTMLElement;
        overwriteSchedule.click();
        const button = document.querySelector('#yui-gen1') as HTMLElement;
        button.click();
      }, 1000);
    })
    .with(when(isInstanceJobPage), () => {
      window.location.assign('https://some.domain/job/aws-inspector/');
    })
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    .with(when(isInstanceListPage), () => {
      const jobs = Array.from(document.querySelectorAll(".job-status-blue"))
        .filter(e => {
          const result = /10 hr/.test(e.children[3].textContent)
          console.log(`${e.children[3].textContent}, ${result}`)
          return result
        })
        .map(e => {
          return e.querySelector('td:nth-child(7) > a').getAttribute('href');
        });

      console.log(jobs)
      if (jobs.length > 0) {
        const job = jobs.pop()
        console.log(job);
        ipcRenderer.send(Events.JOB_FOUND, job)
      }
    })
    .run();
});
