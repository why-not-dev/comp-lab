import { createActionGroup, emptyProps, props } from '@ngrx/store';

interface ClearModelProps {
    constants: boolean;
}

interface ImportSampleModelProps {
    path: string;
    select: boolean;
}

interface RemoveModelCompartmentProps {
    id: string;
}

interface RemoveModelFlowProps {
    id: string;
}

export const AppActions = createActionGroup({
    source: 'App Component',
    events: {
        'Clear Model': props<ClearModelProps>(),
        'Import Model': emptyProps(),
        'Import Sample Model': props<ImportSampleModelProps>(),
        'Export Model': emptyProps(),
        'Remove Compartment': props<RemoveModelCompartmentProps>(),
        'Remove Flow': props<RemoveModelFlowProps>(),
        'Sync Init': emptyProps(),
        'Load Workspaces from LocalStorage': emptyProps(),
        'Load Runs from LocalStorage': emptyProps(),
        'Load Settings from LocalStorage': emptyProps(),
    },
});
