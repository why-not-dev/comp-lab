import {
  Component,
  effect,
  inject,
  Injector,
  OnInit,
  Signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  MatSlideToggleChange,
  MatSlideToggleModule,
} from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SelectedConstant } from '@core/types/processing';
import { OnChangeFn, OnTouchedFn } from '@core/types/util.types';
import { skip } from 'rxjs';
import {
  FormValue,
  PIParametersInputStore,
  SelectedConstantDefinition,
  Value,
} from 'src/app/components/processing/parameters-identification-parameters-input/parameters-identification-parameters-input.store';
import { DatatableComponent } from 'src/app/components/shared/datatable/datatable.component';
import { RowScheme } from 'src/app/components/shared/datatable/datatable.store';

@Component({
    selector: 'app-parameters-identification-parameters-input',
    imports: [
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatTooltipModule,
        MatInputModule,
        MatSlideToggleModule,
        DatatableComponent,
    ],
    providers: [
        PIParametersInputStore,
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: ParametersIdentificationParametersInputComponent,
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: ParametersIdentificationParametersInputComponent,
            multi: true,
        },
    ],
    templateUrl: './parameters-identification-parameters-input.component.html',
    styleUrls: ['./parameters-identification-parameters-input.component.scss'],
})
export class ParametersIdentificationParametersInputComponent
    implements ControlValueAccessor, Validator, OnInit
{
    private readonly injector: Injector = inject(Injector);
    private readonly localStore = inject(PIParametersInputStore);

    private onChange: OnChangeFn | null = null;
    private onTouched: OnTouchedFn | null = null;

    public readonly control: FormGroup = new FormGroup({
        nodesAmount: new FormControl<number | null>(null, [
            Validators.required,
            Validators.min(1),
        ]),
        forecastTime: new FormControl<number | null>(null, [
            Validators.required,
            Validators.min(0),
        ]),
        selectedConstants: new FormControl<
            SelectedConstant[] | SelectedConstantDefinition[] | null
        >(null, [Validators.required]),
        data: new FormControl<Record<string, number>[] | null>(null, [
            Validators.required,
        ]),
    });

    public readonly forecastEnabled: Signal<boolean> =
        this.localStore.forecastEnabled;
    public readonly constantsRowScheme: Signal<
        RowScheme<SelectedConstantDefinition>
    > = this.localStore.constantsRowScheme;
    public readonly dataRowScheme: Signal<RowScheme> =
        this.localStore.dataRowScheme;
    public readonly dataRowValidators: Signal<ValidatorFn[]> =
        this.localStore.dataRowValidators;

    public ngOnInit(): void {
        const valueChanges: Signal<FormValue | undefined> = toSignal(
            this.control.valueChanges.pipe(skip(1)),
            {
                injector: this.injector,
            },
        );

        effect(
            (): void => {
                const formValue: FormValue = this.localStore.formValue();

                untracked((): void => this.control.setValue(formValue));
            },
            {
                injector: this.injector,
            },
        );
        effect(
            (): void => {
                const change: FormValue | undefined = valueChanges();

                if (change === undefined) {
                    return;
                }

                untracked((): void => this.localStore.setValueFromForm(change));
            },
            {
                injector: this.injector,
            },
        );
        effect(
            (): void => {
                const value: Value = this.localStore.value();

                untracked((): void => {
                    if (this.onChange) {
                        this.onChange(value);
                    }

                    if (this.onTouched) {
                        this.onTouched();
                    }
                });
            },
            {
                injector: this.injector,
            },
        );
        effect(
            (): void => {
                const forecastEnabled: boolean =
                    this.localStore.forecastEnabled();

                untracked((): void => {
                    const forecastControl: FormControl<number | null> =
                        this.control.get('forecastTime') as FormControl<
                            number | null
                        >;

                    if (forecastEnabled) {
                        forecastControl.addValidators(Validators.required);

                        return;
                    }

                    forecastControl.reset();
                    forecastControl.removeValidators(Validators.required);
                });
            },
            {
                injector: this.injector,
            },
        );
    }

    public writeValue(value: Value | null): void {
        this.localStore.setValueFromParent(value);
    }

    public registerOnChange(onChange: OnChangeFn<Value>): void {
        this.onChange = onChange;
    }

    public registerOnTouched(onTouched: OnTouchedFn): void {
        this.onTouched = onTouched;
    }

    public setDisabledState(disabled: boolean): void {
        if (disabled) {
            this.control.disable();

            return;
        }

        this.control.enable();
    }

    public validate(): ValidationErrors | null {
        return this.control.valid ? null : { parametersIdentification: true };
    }

    public onForecastTimeToggle(event: MatSlideToggleChange): void {
        this.localStore.setForecastModeState(event.checked);
    }

    public onDataImport(): void {
        this.localStore.importData();
    }
}
