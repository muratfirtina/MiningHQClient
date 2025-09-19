# MiningHQ Client - Mining Operations Management Frontend

## 📋 Proje Hakkında

MiningHQ Client, maden işletmeleri için geliştirilmiş modern ve kullanıcı dostu bir web uygulamasıdır. Angular 16 framework'ü kullanılarak geliştirilmiş bu frontend uygulaması, maden operasyonlarının tüm yönetimsel ihtiyaçlarını karşılayacak zengin bir kullanıcı arayüzü sunar.

## 🎯 Temel Özellikler

### 👥 İnsan Kaynakları Yönetimi
- **Çalışan Yönetimi**: Personel bilgileri, fotoğraf yükleme, dosya yönetimi
- **Mesai Takibi**: Giriş-çıkış saatleri, fazla mesai hesaplamaları
- **İzin Yönetimi**: İzin talepleri, onay süreçleri, izin bakiye takibi
- **Departman & Pozisyon Yönetimi**: Organizasyonel yapı düzenleme

### 🚛 Makine ve Ekipman Yönetimi  
- **Makine Envanteri**: Detaylı makine bilgileri ve takibi
- **Marka & Model Yönetimi**: Makine kategorilendirme sistemi
- **Bakım Yönetimi**: Preventif ve corrective bakım planlaması
- **Günlük İş Verileri**: Makine performans takibi ve raporlama

### 📊 Operasyonel Takip
- **Dashboard**: Gerçek zamanlı operasyonel özetler
- **Yakıt Tüketimi**: Günlük yakıt kullanım analizleri
- **İş Verimliliği**: Üretim metriklerı ve performans göstergeleri
- **Ocak/Saha Yönetimi**: Lokasyon bazlı operasyon takibi

### 🔐 Güvenlik ve Yetkilendirme
- **JWT Authentication**: Güvenli giriş sistemi
- **Rol Tabanlı Yetkilendirme**: Kullanıcı rol ve yetki yönetimi
- **2FA Desteği**: İki faktörlü doğrulama (Email & OTP)
- **Session Management**: Otomatik token yenileme

## 🛠️ Teknoloji Stack'i

### Core Framework & Libraries
- **Angular 16**: Modern component-based framework
- **TypeScript 5.1**: Type-safe development
- **RxJS 7.8**: Reactive programming
- **Angular Material 16**: Material Design components
- **Angular CDK**: Component development kit

### UI & Styling
- **Bootstrap 5.3**: Responsive grid system ve components
- **FontAwesome 6.7**: Icon library
- **SCSS**: Advanced CSS preprocessing
- **Angular Material Theming**: Consistent material design

### Development Tools
- **Angular CLI 16**: Project scaffolding ve build tools
- **Jasmine & Karma**: Unit testing framework
- **TypeScript**: Static type checking

### Third-Party Integrations
- **NGX-Spinner**: Loading indicators
- **NGX-Toastr**: Toast notifications
- **NGX-Pagination**: Advanced pagination
- **NGX-File-Drop**: File upload with drag & drop
- **jsPDF & jsPDF-AutoTable**: PDF generation
- **jQuery & Popper.js**: Additional DOM manipulation

## 🏗️ Proje Yapısı

```
src/
├── app/
│   ├── admin/                 # Admin panel
│   │   ├── components/        # Admin components
│   │   │   ├── brands/        # Marka yönetimi
│   │   │   ├── dashboard/     # Dashboard
│   │   │   ├── department/    # Departman yönetimi
│   │   │   ├── employees/     # Çalışan yönetimi
│   │   │   ├── jobs/          # Pozisyon yönetimi
│   │   │   ├── leave-types/   # İzin türleri
│   │   │   ├── machine-types/ # Makine türleri
│   │   │   ├── machines/      # Makine yönetimi
│   │   │   ├── models/        # Model yönetimi
│   │   │   ├── quarries/      # Ocak yönetimi
│   │   │   └── users/         # Kullanıcı yönetimi
│   │   └── layout/            # Admin layout components
│   ├── base/                  # Base classes ve interfaces
│   ├── contracts/             # TypeScript interfaces
│   ├── dialogs/               # Modal dialoglar
│   ├── directives/            # Custom directives
│   ├── pipes/                 # Custom pipes
│   ├── services/              # API services
│   │   ├── common/            # Ortak servisler
│   │   └── models/            # Data models
│   └── ui/                    # Public UI components
├── assets/                    # Static assets
└── environments/              # Environment configurations
```

## 📱 Kullanıcı Arayüzü Özellikleri

### 🎨 Modern ve Responsive Design
- **Material Design**: Google'ın design guidelines'ına uygun
- **Mobile-First**: Tüm cihazlarda optimum performans
- **Dark/Light Theme**: Kullanıcı tercihi bazlı tema desteği
- **Accessible**: WCAG guidelines uyumlu erişilebilirlik

### 📊 Dashboard ve Raporlama
- **Real-time Data**: Canlı veri akışı ve güncelleme
- **Interactive Charts**: Grafikler ve görsel analizler
- **Export Functionality**: PDF ve Excel export özellikleri
- **Advanced Filtering**: Çoklu kriterlere göre filtreleme

### 🔄 State Management
- **Service-based State**: Angular servisleri ile state management
- **RxJS Observables**: Reactive data flow
- **Local Storage**: Client-side data persistence
- **Session Management**: Kullanıcı oturumu takibi

### 📤 File Management
- **Drag & Drop Upload**: Kolay dosya yükleme
- **Multi-format Support**: Resim, PDF, Excel dosya desteği
- **Cloud Storage Integration**: Çoklu cloud provider desteği
- **Progress Tracking**: Yükleme durumu takibi

## 🚀 Kurulum ve Geliştirme

### Gereksinimler
- **Node.js 16+**: JavaScript runtime
- **npm 8+** veya **yarn**: Package manager
- **Angular CLI 16**: Angular development tools

### Kurulum Adımları

1. **Repository'yi klonlayın**
```bash
git clone [repository-url]
cd MiningHQClient
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
# veya
yarn install
```

3. **Environment ayarlarını yapın**
`src/environments/environment.ts` dosyasını düzenleyin:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5278/api'
};
```

4. **Geliştirme sunucusunu başlatın**
```bash
ng serve
# veya
npm start
```

Uygulama `http://localhost:4200` adresinde çalışacaktır.

### Build ve Deploy

**Production Build**
```bash
ng build --prod
```

**Test Çalıştırma**
```bash
ng test
```

**Linting**
```bash
ng lint
```

## 🔧 Yapılandırma

### Environment Configuration
```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5278/api',
  fileBaseUrl: 'http://localhost:5278',
  applicationName: 'MiningHQ'
};
```

### Angular Material Theme
```scss
// styles.scss
@import '@angular/material/theming';
@include mat-core();

$primary: mat-palette($mat-indigo);
$accent: mat-palette($mat-pink, A200, A100, A400);
$warn: mat-palette($mat-red);

$theme: mat-light-theme((
  color: (
    primary: $primary,
    accent: $accent,
    warn: $warn,
  )
));

@include angular-material-theme($theme);
```

## 📡 API Entegrasyonu

### HTTP Interceptors
- **Auth Interceptor**: Otomatik token ekleme
- **Error Interceptor**: Global error handling
- **Loading Interceptor**: Loading state management

### Service Layer
```typescript
// employee.service.ts
@Injectable({
  providedIn: 'root'
})
export class EmployeeService extends BaseService {
  
  getList(pageRequest: PageRequest): Observable<ListItemsDto<Employee>> {
    return this.httpClient.get<ListItemsDto<Employee>>(
      `${this.apiUrl}/employees`, 
      { params: pageRequest }
    );
  }
  
  getById(id: string): Observable<Employee> {
    return this.httpClient.get<Employee>(`${this.apiUrl}/employees/${id}`);
  }
  
  create(employee: CreateEmployee): Observable<CreatedEmployee> {
    return this.httpClient.post<CreatedEmployee>(
      `${this.apiUrl}/employees`, 
      employee
    );
  }
}
```

## 🎨 Component Yapısı

### Smart vs Dumb Components
- **Smart Components**: Container components, state management
- **Dumb Components**: Presentational components, pure functions

### Component Example
```typescript
@Component({
  selector: 'app-employee-list',
  template: `
    <div class="employee-list">
      <mat-table [dataSource]="employees" class="mat-elevation-z8">
        <ng-container matColumnDef="firstName">
          <mat-header-cell *matHeaderCellDef>Ad</mat-header-cell>
          <mat-cell *matCellDef="let employee">{{employee.firstName}}</mat-cell>
        </ng-container>
        <!-- Diğer columns... -->
        <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
        <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
      </mat-table>
    </div>
  `,
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  displayedColumns = ['firstName', 'lastName', 'department', 'actions'];
  
  constructor(private employeeService: EmployeeService) {}
  
  ngOnInit(): void {
    this.loadEmployees();
  }
  
  loadEmployees(): void {
    this.employeeService.getList({ pageIndex: 0, pageSize: 10 })
      .subscribe(response => {
        this.employees = response.items;
      });
  }
}
```

## 🔐 Authentication & Authorization

### Auth Guard
```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
```

### JWT Token Management
```typescript
@Injectable()
export class AuthService {
  private tokenKey = 'authToken';
  
  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }
  
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  
  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }
}
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 0-767px
- **Tablet**: 768-1023px  
- **Desktop**: 1024px+

### Material Design Responsive Features
```scss
.responsive-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  
  @include breakpoint(tablet) {
    grid-template-columns: 1fr 1fr;
  }
  
  @include breakpoint(desktop) {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## 🧪 Testing

### Unit Testing
```typescript
describe('EmployeeComponent', () => {
  let component: EmployeeComponent;
  let fixture: ComponentFixture<EmployeeComponent>;
  let employeeService: jasmine.SpyObj<EmployeeService>;
  
  beforeEach(() => {
    const spy = jasmine.createSpyObj('EmployeeService', ['getList']);
    
    TestBed.configureTestingModule({
      declarations: [EmployeeComponent],
      providers: [{ provide: EmployeeService, useValue: spy }]
    });
    
    fixture = TestBed.createComponent(EmployeeComponent);
    component = fixture.componentInstance;
    employeeService = TestBed.inject(EmployeeService) as jasmine.SpyObj<EmployeeService>;
  });
  
  it('should load employees on init', () => {
    const mockEmployees = [{ id: '1', firstName: 'John', lastName: 'Doe' }];
    employeeService.getList.and.returnValue(of({ items: mockEmployees }));
    
    component.ngOnInit();
    
    expect(employeeService.getList).toHaveBeenCalled();
    expect(component.employees).toEqual(mockEmployees);
  });
});
```

## 📈 Performance Optimizations

### Lazy Loading
```typescript
const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard]
  }
];
```

### OnPush Change Detection
```typescript
@Component({
  selector: 'app-employee-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`
})
export class EmployeeCardComponent {
  @Input() employee: Employee;
}
```

### TrackBy Functions
```typescript
trackByEmployeeId(index: number, employee: Employee): string {
  return employee.id;
}
```

## 🎯 Best Practices

### Code Organization
- **Feature Modules**: Functionality by domain
- **Shared Components**: Reusable UI components
- **Barrel Exports**: Clean import statements
- **Consistent Naming**: PascalCase for classes, camelCase for variables

### Error Handling
```typescript
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.error('Global error:', error);
    this.notificationService.showError('Bir hata oluştu!');
  }
}
```

Bu modern Angular frontend uygulaması, maden işletmelerinin ihtiyaçlarına göre özelleştirilmiş zengin bir kullanıcı deneyimi sunmakta ve backend API ile sorunsuz entegrasyon sağlamaktadır.
