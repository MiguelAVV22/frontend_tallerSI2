import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

function passwordsMatch(control: AbstractControl) {
  const pwd  = control.get('password')?.value;
  const conf = control.get('confirmPassword')?.value;
  return pwd === conf ? null : { mismatch: true };
}

@Component({
  selector: 'app-registrarse',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './registrarse.component.html',
})
export class RegistrarseComponent implements OnInit {
  form: FormGroup;
  loading = false;
  serverError = '';
  tenants: any[] = [];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group(
      {
        email:           ['', [Validators.required, Validators.email]],
        username:        ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
        full_name:       [''],
        tenant_id:       ['', Validators.required],
        password:        ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordsMatch },
    );
  }

  ngOnInit(): void {
    this.auth.getPublicTenants().subscribe({
      next: (data) => {
        this.tenants = data;
        if (data.length > 0) {
          this.form.patchValue({ tenant_id: data[0].id });
        }
      },
      error: (err) => {
        console.error('Error al cargar redes de talleres:', err);
      }
    });
  }

  get email()           { return this.form.get('email')!; }
  get username()        { return this.form.get('username')!; }
  get full_name()       { return this.form.get('full_name')!; }
  get tenant_id()       { return this.form.get('tenant_id')!; }
  get password()        { return this.form.get('password')!; }
  get confirmPassword() { return this.form.get('confirmPassword')!; }
  get mismatch()        { return this.form.hasError('mismatch') && this.confirmPassword.touched; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.serverError = '';

    const { confirmPassword, ...payload } = this.form.value;

    this.auth.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/app/acceso-registro/registrar-taller']);
      },
      error: (err) => {
        this.serverError = err.error?.detail ?? 'Error al registrarse';
        this.loading = false;
      },
    });
  }
}
