# job-handler

[![LoopBack](https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png)](http://loopback.io/)

## Installation

Install JobHandler using `npm`;

```sh
$ [npm install | yarn add] job-component
```

## Basic Use

Configure and load JobHandler in the application constructor
as shown below.

```ts
import {JobHandler, JobHandlerOptions, DEFAULT_JOB_COMPONENT_OPTIONS} from 'job-component';
// ...
export class MyApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
    const opts: JobHandlerOptions = DEFAULT_JOB_COMPONENT_OPTIONS;
    this.configure(JobHandlerBindings.COMPONENT).to(opts);
      // Put the configuration options here
    });
    this.component(JobHandler);
    // ...
  }
  // ...
}
```