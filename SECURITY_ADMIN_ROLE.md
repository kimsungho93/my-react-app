# 관리자 권한 보안 가이드

## 개요
대시보드의 "사용 입력" 버튼은 관리자(ADMIN) 권한을 가진 사용자만 사용할 수 있도록 구현되었습니다.

## 보안 계층

### 1. 프론트엔드 보안 (UI 레벨)
**파일**: `src/pages/Dashboard.tsx`

```typescript
// Redux에서 현재 로그인한 사용자 정보 조회
const { user } = useAppSelector((state) => state.auth);

// 관리자 권한 확인 (role이 'ADMIN'인 경우만 true)
const isAdmin = useMemo(() => user?.role === 'ADMIN', [user]);

// UI 조건부 렌더링
{isAdmin && (
  <Button onClick={handleDeductButtonClick}>
    사용 입력
  </Button>
)}
```

**역할**:
- ✅ 일반 사용자에게 버튼을 숨김
- ✅ UX 개선 (권한 없는 사용자는 버튼을 볼 수 없음)
- ❌ **단독으로는 보안 불충분** (개발자 도구로 우회 가능)

### 2. 백엔드 보안 (API 레벨) ⭐ 필수
**위치**: Spring Boot 백엔드 API

백엔드에서 반드시 다음을 검증해야 합니다:

```java
@PostMapping("/budgets/{budgetId}/deduct")
public ResponseEntity<?> deductBudget(
    @PathVariable Long budgetId,
    @RequestBody BudgetDeductRequest request,
    @AuthenticationPrincipal UserDetails userDetails
) {
    // 1. JWT 토큰 검증 (Spring Security)
    // 2. 사용자 권한 확인
    if (!userDetails.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"))) {
        throw new ForbiddenException("관리자 권한이 필요합니다.");
    }

    // 3. 비즈니스 로직 실행
    return budgetService.deductBudget(budgetId, request);
}
```

## 보안 흐름

```
1. 사용자 로그인
   ↓
2. JWT 토큰 발급 (role 정보 포함)
   ↓
3. 프론트엔드: Redux에 사용자 정보 저장 (role 포함)
   ↓
4. 대시보드 렌더링
   ↓
5. 프론트엔드: user.role === 'ADMIN' 체크
   - ADMIN → 버튼 표시
   - USER → 버튼 숨김
   ↓
6. (ADMIN만) 사용자가 버튼 클릭
   ↓
7. API 요청 (Authorization: Bearer <JWT>)
   ↓
8. 백엔드: JWT 검증 및 권한 확인
   - 권한 있음 → 200 OK
   - 권한 없음 → 403 Forbidden
```

## 위변조 방지

### 프론트엔드에서 role 수정 시도 시
❌ **공격 시나리오**:
```javascript
// 개발자 도구에서 Redux state 수정 시도
store.dispatch({
  type: 'auth/setUser',
  payload: { ...user, role: 'ADMIN' }
});
```

✅ **방어**:
1. **JWT 토큰은 변경 불가**: JWT는 서버의 비밀키로 서명되어 있어 클라이언트에서 수정 불가
2. **백엔드 검증**: API 호출 시 서버가 JWT를 다시 검증하고 실제 role을 확인
3. **결과**: UI에서 버튼이 보이더라도 API 호출 시 `403 Forbidden` 반환

### API 직접 호출 시도 시
❌ **공격 시나리오**:
```bash
curl -X POST https://api.example.com/budgets/123/deduct \
  -H "Authorization: Bearer <일반유저토큰>" \
  -d '{"amount": 10000}'
```

✅ **방어**:
- 백엔드에서 JWT의 role 확인
- ADMIN이 아니면 `403 Forbidden` 반환

## 백엔드 구현 체크리스트

### 필수 구현 사항
- [ ] JWT 토큰에 role 정보 포함
- [ ] `/budgets/{budgetId}/deduct` API에 `@PreAuthorize("hasRole('ADMIN')")` 또는 수동 권한 체크
- [ ] 403 Forbidden 에러 핸들링
- [ ] 권한 에러 시 명확한 메시지 반환

### Spring Security 설정 예시
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/login").permitAll()
                .requestMatchers("/budgets/*/deduct").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

## 테스트 시나리오

### 정상 케이스
1. ADMIN 계정으로 로그인
2. 대시보드에서 "사용 입력" 버튼 확인
3. 버튼 클릭 → 모달 열림
4. 금액 입력 후 제출
5. API 호출 성공 (200 OK)

### 비정상 케이스
1. USER 계정으로 로그인
2. 대시보드에서 버튼 없음 (숨겨짐)
3. (개발자 도구로 강제 표시하더라도)
4. API 호출 시 403 Forbidden 반환

## 주의사항

⚠️ **프론트엔드 검증만으로는 충분하지 않습니다!**
- 프론트엔드 코드는 사용자가 쉽게 수정 가능
- 반드시 백엔드에서 최종 권한 검증 필요

⚠️ **JWT 토큰 관리**
- Access Token은 localStorage에 저장 (XSS 취약점 주의)
- Refresh Token은 httpOnly 쿠키에 저장 (CSRF 방지)
- HTTPS 필수

⚠️ **role 값 표준화**
- 프론트엔드: `'ADMIN'` (문자열)
- 백엔드: `ROLE_ADMIN` (Spring Security 규칙)
- 일관성 유지 필요

## 관련 파일

- 프론트엔드: `src/pages/Dashboard.tsx`
- Redux: `src/store/slices/authSlice.ts`
- 타입: `src/types/auth.types.ts`
- 백엔드: (Spring Boot 프로젝트 참조)
