import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { from, Observable } from 'rxjs';
import {
  calculateProjectDependencies,
  createTmpTsConfig,
} from '@nrwl/workspace/src/utils/buildable-libs-utils';
import { join } from 'path';
import { createProjectGraph } from '@nrwl/workspace/src/core/project-graph';
import { Schema as BrowserBuilderSchema } from '@angular-devkit/build-angular/src/browser/schema';
import { switchMap } from 'rxjs/operators';

function run(
  options: BrowserBuilderSchema & JsonObject,
  context: BuilderContext
): Observable<BuilderOutput> {
  const projGraph = createProjectGraph();
  const { target, dependencies } = calculateProjectDependencies(
    projGraph,
    context
  );
  options.tsConfig = createTmpTsConfig(
    join(context.workspaceRoot, options.tsConfig),
    context.workspaceRoot,
    target.data.root,
    dependencies
  );

  return from(
    context.scheduleBuilder('@angular-devkit/build-angular:browser', options, {
      target: context.target,
      logger: context.logger as any,
    })
  ).pipe(switchMap((x) => x.result));
}

export default createBuilder<JsonObject & BrowserBuilderSchema>(run);
