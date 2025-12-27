:::mermaid
sequenceDiagram
    %% autonumber
    actor User as ユーザー
    participant Client as SPA (AuthPage)
    participant Router as Router
    participant API as Backend API


    User->>Client: Signup送信 (MFA ON/OFF選択)
    Client->>API: POST /auth/signup

    alt MFA ONの場合 (tmpAuthToken返却)
        API-->>Client: 201 Created (Set-Cookie: tmpAuthToken)
        Client->>Client: viewを 'mfa' (setup) へ
        Note right of Client: トースト: "2段階認証を設定してください"
        Client->>API: GET /auth/mfa/setup
        API-->>Client: QRコードデータ
				User->>Client: 秘密鍵取り込み
				Client->>Client: viewを 'login' へ
    else MFA OFFの場合 (トークンなし)
        API-->>Client: 201 Created
        Client->>Client: viewを 'login' へ
        Note right of Client: トースト: "ログインしてください"
    end


    User->>Client: Login送信
    Client->>API: POST /auth/login

    alt MFA有効ユーザー (tmpAuthToken返却)
        API-->>Client: 200 OK (Set-Cookie: tmpAuthToken)
        Client->>Client: viewを 'mfa' (verify) へ
    else MFA無効ユーザー (authToken直接返却)
        API-->>Client: 200 OK (Set-Cookie: accessToken)
        Client->>Router: navigateTo('/dashboard')
    end

    User->>Client: 6桁コード入力
    Client->>API: POST /auth/mfa/verify or /login
    API-->>Client: 200 OK (Set-Cookie: accessToken)
    Client->>Router: navigateTo('/dashboard')
    Note right of Router: Routerがmainを入れ替えるが<br/>Toasterはbody直下なので消えない
:::
