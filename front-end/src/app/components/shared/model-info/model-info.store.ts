import { computed, inject, Signal } from '@angular/core';
import { MATH_JS } from '@core/injection-tokens';
import {
  Compartment,
  Constant,
  Flow,
  Intervention,
  Model,
} from '@core/types/model.types';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';

export interface State {
    _model: Model | null;
}

const initialState: State = {
    _model: null,
};

export const InfoStore = signalStore(
    withState(initialState),
    withProps(() => {
        const mathJs = inject(MATH_JS);

        return {
            _mathJs: mathJs,
        };
    }),
    withComputed((store) => {
        const compartmentsExpressions: Signal<string[]> = computed(
            (): string[] => {
                const model: Model | null = store._model();

                if (!model) {
                    return [];
                }

                return model.compartments.map(
                    (compartment: Compartment): string => {
                        const connectedFlows: Flow[] = model.flows.filter(
                            (flow: Flow): boolean =>
                                flow.source === compartment.id ||
                                flow.target === compartment.id,
                        );
                        const initialExpressionString: string =
                            store._mathJs
                                .parse(`d${compartment.name}(t)/dt`)
                                .toTex() + ' = ';
                        let isExpressionEmpty: boolean = true;

                        return connectedFlows.length
                            ? connectedFlows.reduce(
                                  (expression: string, flow: Flow): string => {
                                      const texExpression: string =
                                          store._mathJs
                                              .parse(flow.equation)
                                              .toTex();

                                      let newExpression: string = expression;

                                      if (flow.source === compartment.id) {
                                          newExpression += `- (${texExpression})`;

                                          isExpressionEmpty = false;
                                      }

                                      if (flow.target === compartment.id) {
                                          const signString: string =
                                              isExpressionEmpty ? '' : '+';

                                          newExpression += `${signString} (${texExpression})`;

                                          isExpressionEmpty = false;
                                      }

                                      return newExpression;
                                  },
                                  initialExpressionString,
                              )
                            : `${initialExpressionString} 0`;
                    },
                );
            },
        );

        const constantsExpressions: Signal<string[]> = computed(
            (): string[] => {
                const model: Model | null = store._model();

                if (!model) {
                    return [];
                }

                return model.constants.map(
                    (constant: Constant): string =>
                        `${constant.name} = ${constant.value}`,
                );
            },
        );

        const interventionsExpressions: Signal<string[]> = computed(
            (): string[] => {
                const model: Model | null = store._model();

                if (!model) {
                    return [];
                }

                return model.interventions.map(
                    (intervention: Intervention): string =>
                        `${intervention.name} = ${intervention.name}(t)`,
                );
            },
        );

        return {
            compartmentsExpressions,
            constantsExpressions,
            interventionsExpressions,
        };
    }),
    withMethods((store) => {
        const setModel = (model: Model | null) =>
            patchState(store, {
                _model: model,
            });

        return {
            setModel,
        };
    }),
);
