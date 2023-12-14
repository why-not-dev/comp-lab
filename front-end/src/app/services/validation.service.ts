import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IValidationResponse } from '../core/interfaces';

@Injectable({
    providedIn: 'root',
})
export class ValidationService {
    constructor(private readonly httpClient: HttpClient) {}

    public validateEquation(
        expression: string,
        allowedSymbols: string[]
    ): Observable<IValidationResponse> {
        return this.httpClient.post<IValidationResponse>(
            'http://localhost:5000/validate-expression',
            {
                expression,
                allowedSymbols,
            }
        );
    }

    public validateCompartmentName(
        name: string,
        existingCompartmentNames: string[]
    ): boolean {
        if (existingCompartmentNames.includes(name)) {
            return false;
        }

        return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
    }
}
