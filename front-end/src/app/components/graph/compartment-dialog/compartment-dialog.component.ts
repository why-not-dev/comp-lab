import { Component, effect, inject, Signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Compartment } from '@core/types/model.types';
import { definitionName } from '@core/validators';
import { Store } from '@ngrx/store';
import { skip } from 'rxjs';
import {
  CompartmentDialogStore,
  FormValue,
} from 'src/app/components/graph/compartment-dialog/compartment-dialog.store';
import { CompartmentDialogActions } from 'src/app/state/actions/compartment-dialog.actions';

@Component({
    selector: 'app-compartment-dialog',
    imports: [
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
    ],
    providers: [CompartmentDialogStore],
    templateUrl: './compartment-dialog.component.html',
    styleUrls: ['./compartment-dialog.component.scss'],
})
export class CompartmentDialogComponent {
    private readonly store: Store = inject(Store);
    private readonly localStore = inject(CompartmentDialogStore);
    private readonly dialogRef: MatDialogRef<CompartmentDialogComponent, void> =
        inject(MatDialogRef<CompartmentDialogComponent, void>);

    public readonly editMode: Signal<boolean> = this.localStore.editMode;

    public readonly control: FormGroup = new FormGroup({
        name: new FormControl<string>('', [
            Validators.required,
            definitionName(this.localStore.symbols),
        ]),
        value: new FormControl<number>(0, [
            Validators.required,
            Validators.min(0),
        ]),
    });

    constructor() {
        const valueChanges: Signal<FormValue | undefined> = toSignal(
            this.control.valueChanges.pipe(skip(1)),
        );
        const initialData: Compartment | undefined = inject(MAT_DIALOG_DATA);

        effect((): void => {
            const change: FormValue | undefined = valueChanges();

            if (change === undefined) {
                return;
            }

            untracked((): void => this.localStore.setValueFromForm(change));
        });

        effect(() => {
            const formValue: FormValue = this.localStore.formValue();

            untracked((): void => this.control.patchValue(formValue));
        });

        this.localStore.setInitialData(initialData ?? null);
    }

    public onClose(): void {
        this.dialogRef.close();
    }

    public onAccept(): void {
        this.store.dispatch(
            CompartmentDialogActions.upsertCompartment({
                compartment: this.localStore.value(),
            }),
        );
        this.dialogRef.close();
    }
}
