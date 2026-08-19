# DeepSeek Harness Mac Control

> **Give DeepSeek Harness hands on your Mac.** Inspect browser tabs, open pages, switch apps, read controls, type, click, press keys, and capture the screen through one small native macOS plugin.

<p>
  <strong>Language / 语言 / 言語 / 언어:</strong>
  <a href="#简体中文">简体中文</a> ·
  <a href="#english">English</a> ·
  <a href="#日本語">日本語</a> ·
  <a href="#한국어">한국어</a> ·
  <a href="#español">Español</a> ·
  <a href="#français">Français</a> ·
  <a href="#deutsch">Deutsch</a> ·
  <a href="#português">Português</a> ·
  <a href="#русский">Русский</a> ·
  <a href="#العربية">العربية</a> ·
  <a href="#हिन्दी">हिन्दी</a> ·
  <a href="#繁體中文">繁體中文</a>
</p>

<details open>
<summary id="简体中文"><strong>简体中文</strong></summary>

把本地 DeepSeek Harness 变成真正能操作 Mac 的助手：读取浏览器标签页、打开网页、切换应用、读取界面控件、输入文字、点击、按键并截图。

`dsh-mac-control` 是一个原生 macOS DSH 插件，提供两个工具：

- `mac_browser`：控制 Safari 和 Google Chrome 的标签页。
- `mac_desktop`：读取和操作本机应用、窗口及辅助功能控件，并截取屏幕。

**工作原理：** 插件不启动 HTTP 服务、不代理浏览器流量，也不保存凭据。它把经过校验的请求交给 macOS 原生的 `osascript`（JXA/System Events）、`open` 和 `screencapture` 执行，权限仍由 macOS 的自动化、辅助功能和屏幕录制设置管理。

**安装：**

```sh
dsh plugin --profile web add dsh-mac-control
```

重启 web profile 后，让 Harness 使用 `mac_browser` 或 `mac_desktop`。首次使用时，请在 macOS 中批准 Harness 进程需要的权限。

**安全默认值：** 仅允许 `http`/`https` 地址；浏览器和桌面目标可通过配置限制；文本长度和坐标会被校验；工具说明明确禁止发送密码、API Key、Cookie 或恢复码。

</details>

<details open>
<summary id="english"><strong>English</strong></summary>

Turn a local DeepSeek Harness session into a practical Mac operator: inspect browser tabs, open pages, switch apps, read accessible controls, type, click, press keys, and capture the screen.

`dsh-mac-control` is a native macOS DSH plugin with two focused tools:

- `mac_browser` for Safari and Google Chrome tabs.
- `mac_desktop` for local apps, windows, accessibility controls, and screenshots.

**How it works:** The plugin starts no HTTP server, proxies no browser traffic, and stores no credentials. Validated requests are passed to macOS `osascript` (JXA/System Events), `open`, and `screencapture`; macOS continues to control Automation, Accessibility, and Screen Recording permissions.

**Install:**

```sh
dsh plugin --profile web add dsh-mac-control
```

Restart the web profile and ask Harness to use `mac_browser` or `mac_desktop`. Approve the required macOS permissions on first use.

**Safety defaults:** Only `http` and `https` URLs are accepted. Browser and desktop targets can be allowlisted. Text size and coordinates are validated. The tool descriptions prohibit sending passwords, API keys, cookies, or recovery codes.

</details>

<details>
<summary id="日本語"><strong>日本語</strong></summary>

DeepSeek Harness に Mac を操作する力を与えます。ブラウザのタブを確認し、ページを開き、アプリを切り替え、アクセシビリティ要素を読み取り、入力、クリック、キー操作、スクリーンショットを実行できます。

`dsh-mac-control` は macOS 用のネイティブ DSH プラグインです。`mac_browser` は Safari と Google Chrome のタブを、`mac_desktop` はアプリ、ウィンドウ、アクセシビリティ要素、画面キャプチャを扱います。

**仕組み：** HTTP サーバーやプロキシを起動せず、認証情報も保存しません。検証済みの要求を `osascript`（JXA/System Events）、`open`、`screencapture` に渡し、権限は macOS が管理します。

**インストール：**

```sh
dsh plugin --profile web add dsh-mac-control
```

web profile を再起動し、初回利用時に必要な macOS 権限を許可してください。URL、文字数、座標の検証と、パスワード・API キー・Cookie・復旧コードを送信しない安全設定が有効です。

</details>

<details>
<summary id="한국어"><strong>한국어</strong></summary>

DeepSeek Harness가 Mac을 직접 다루도록 해 줍니다. 브라우저 탭을 확인하고, 페이지를 열고, 앱을 전환하고, 접근성 컨트롤을 읽고, 입력, 클릭, 키 입력, 화면 캡처를 수행할 수 있습니다.

`dsh-mac-control`은 macOS용 네이티브 DSH 플러그인입니다. `mac_browser`는 Safari와 Google Chrome 탭을 제어하고, `mac_desktop`은 로컬 앱, 창, 접근성 요소와 스크린샷을 다룹니다.

**작동 방식:** HTTP 서버나 브라우저 프록시를 실행하지 않으며 자격 증명을 저장하지 않습니다. 검증된 요청을 `osascript`(JXA/System Events), `open`, `screencapture`에 전달하고 권한은 macOS가 관리합니다.

**설치:**

```sh
dsh plugin --profile web add dsh-mac-control
```

web profile을 다시 시작하고 처음 사용할 때 필요한 macOS 권한을 승인하세요. URL, 텍스트 크기, 좌표를 검증하며 비밀번호, API 키, 쿠키, 복구 코드를 전송하지 않습니다.

</details>

<details>
<summary id="español"><strong>Español</strong></summary>

Convierte una sesión local de DeepSeek Harness en un operador práctico de Mac: inspecciona pestañas, abre páginas, cambia de aplicación, lee controles de accesibilidad, escribe, hace clic, pulsa teclas y captura la pantalla.

`dsh-mac-control` es un complemento DSH nativo para macOS. `mac_browser` controla pestañas de Safari y Google Chrome; `mac_desktop` trabaja con aplicaciones, ventanas, controles de accesibilidad y capturas.

**Cómo funciona:** No inicia un servidor HTTP, no actúa como proxy y no guarda credenciales. Las solicitudes validadas se entregan a `osascript` (JXA/System Events), `open` y `screencapture`, mientras macOS administra los permisos.

**Instalación:**

```sh
dsh plugin --profile web add dsh-mac-control
```

Reinicia el perfil web y concede los permisos de macOS la primera vez. Solo se aceptan URL `http`/`https`; se validan texto y coordenadas; no se envían contraseñas, claves API, cookies ni códigos de recuperación.

</details>

<details>
<summary id="français"><strong>Français</strong></summary>

Transformez une session DeepSeek Harness locale en opérateur Mac : inspectez les onglets, ouvrez des pages, changez d’application, lisez les contrôles d’accessibilité, saisissez du texte, cliquez, appuyez sur des touches et capturez l’écran.

`dsh-mac-control` est un plugin DSH natif pour macOS. `mac_browser` contrôle les onglets de Safari et Google Chrome ; `mac_desktop` agit sur les applications, fenêtres, contrôles d’accessibilité et captures.

**Fonctionnement :** aucun serveur HTTP, proxy ou stockage d’identifiants. Les requêtes validées sont transmises à `osascript` (JXA/System Events), `open` et `screencapture` ; macOS conserve la gestion des autorisations.

**Installation :**

```sh
dsh plugin --profile web add dsh-mac-control
```

Redémarrez le profil web et accordez les autorisations macOS au premier usage. Les URL sont limitées à `http`/`https` et les mots de passe, clés API, cookies et codes de récupération ne sont jamais envoyés.

</details>

<details>
<summary id="deutsch"><strong>Deutsch</strong></summary>

Mache aus einer lokalen DeepSeek-Harness-Sitzung einen praktischen Mac-Bediener: Browser-Tabs prüfen, Seiten öffnen, Apps wechseln, Bedienungshilfen lesen, Text eingeben, klicken, Tasten drücken und Screenshots aufnehmen.

`dsh-mac-control` ist ein natives DSH-Plugin für macOS. `mac_browser` steuert Safari- und Google-Chrome-Tabs; `mac_desktop` arbeitet mit Apps, Fenstern, Bedienungshilfen und Bildschirmaufnahmen.

**Funktionsweise:** Kein HTTP-Server, kein Browser-Proxy und keine gespeicherten Zugangsdaten. Geprüfte Anfragen werden an `osascript` (JXA/System Events), `open` und `screencapture` übergeben; macOS verwaltet weiterhin die Berechtigungen.

**Installation:**

```sh
dsh plugin --profile web add dsh-mac-control
```

Web-Profil neu starten und beim ersten Einsatz die macOS-Berechtigungen erlauben. Akzeptiert werden nur `http`/`https`; Passwörter, API-Schlüssel, Cookies und Wiederherstellungscodes werden nicht übertragen.

</details>

<details>
<summary id="português"><strong>Português</strong></summary>

Transforme uma sessão local do DeepSeek Harness em um operador prático do Mac: inspecione abas, abra páginas, alterne aplicativos, leia controles de acessibilidade, digite, clique, pressione teclas e capture a tela.

`dsh-mac-control` é um plugin DSH nativo para macOS. `mac_browser` controla abas do Safari e do Google Chrome; `mac_desktop` atua sobre aplicativos, janelas, acessibilidade e capturas de tela.

**Como funciona:** não inicia servidor HTTP, não usa proxy e não armazena credenciais. Solicitações validadas são encaminhadas para `osascript` (JXA/System Events), `open` e `screencapture`; o macOS mantém o controle das permissões.

**Instalação:**

```sh
dsh plugin --profile web add dsh-mac-control
```

Reinicie o perfil web e conceda as permissões do macOS no primeiro uso. Apenas URLs `http`/`https` são aceitas, e senhas, chaves de API, cookies e códigos de recuperação nunca são enviados.

</details>

<details>
<summary id="русский"><strong>Русский</strong></summary>

Превратите локальную сессию DeepSeek Harness в практического оператора Mac: просматривайте вкладки, открывайте страницы, переключайте приложения, читайте элементы доступности, вводите текст, нажимайте кнопки и клавиши и делайте снимки экрана.

`dsh-mac-control` — нативный DSH-плагин для macOS. `mac_browser` управляет вкладками Safari и Google Chrome, а `mac_desktop` работает с приложениями, окнами, элементами доступности и скриншотами.

**Принцип работы:** плагин не запускает HTTP-сервер, не проксирует трафик и не хранит учетные данные. Проверенные запросы передаются в `osascript` (JXA/System Events), `open` и `screencapture`; разрешения контролирует macOS.

**Установка:**

```sh
dsh plugin --profile web add dsh-mac-control
```

Перезапустите web profile и при первом использовании выдайте разрешения macOS. Принимаются только URL `http`/`https`; пароли, API-ключи, cookie и коды восстановления не передаются.

</details>

<details>
<summary id="العربية"><strong>العربية</strong></summary>

<div dir="rtl">
حوّل جلسة DeepSeek Harness المحلية إلى مشغّل عملي لجهاز Mac: افحص علامات تبويب المتصفح، افتح الصفحات، بدّل التطبيقات، اقرأ عناصر الوصول، اكتب، انقر، اضغط المفاتيح والتقط الشاشة.

`dsh-mac-control` إضافة DSH أصلية لنظام macOS. تتعامل `mac_browser` مع علامات تبويب Safari وGoogle Chrome، بينما تتعامل `mac_desktop` مع التطبيقات والنوافذ وعناصر الوصول ولقطات الشاشة.

**آلية العمل:** لا تشغّل الإضافة خادم HTTP ولا تعمل كوكيل للمتصفح ولا تحفظ بيانات الاعتماد. تُمرّر الطلبات التي تم التحقق منها إلى `osascript` (JXA/System Events) و`open` و`screencapture`، ويظل macOS مسؤولًا عن الصلاحيات.
</div>

**التثبيت:**

```sh
dsh plugin --profile web add dsh-mac-control
```

أعد تشغيل ملف web profile واسمح بصلاحيات macOS عند الاستخدام الأول. تُقبل عناوين `http` و`https` فقط، ولا تُرسل كلمات المرور أو مفاتيح API أو ملفات Cookie أو رموز الاسترداد.

</details>

<details>
<summary id="हिन्दी"><strong>हिन्दी</strong></summary>

स्थानीय DeepSeek Harness सत्र को Mac संचालक में बदलें: ब्राउज़र टैब देखें, पेज खोलें, ऐप बदलें, accessibility controls पढ़ें, लिखें, क्लिक करें, कुंजी दबाएँ और स्क्रीनशॉट लें।

`dsh-mac-control` macOS के लिए native DSH plugin है। `mac_browser` Safari और Google Chrome टैब संभालता है, जबकि `mac_desktop` स्थानीय ऐप, विंडो, accessibility controls और screenshots संभालता है।

**कैसे काम करता है:** यह HTTP server या browser proxy नहीं चलाता और credentials सुरक्षित नहीं रखता। सत्यापित अनुरोध `osascript` (JXA/System Events), `open` और `screencapture` को दिए जाते हैं; permissions macOS नियंत्रित करता है।

**इंस्टॉल करें:**

```sh
dsh plugin --profile web add dsh-mac-control
```

web profile को restart करें और पहली बार macOS permissions दें। केवल `http`/`https` URL स्वीकार होते हैं; password, API key, cookie और recovery code नहीं भेजे जाते।

</details>

<details>
<summary id="繁體中文"><strong>繁體中文</strong></summary>

讓本機 DeepSeek Harness 成為真正能操作 Mac 的助手：讀取瀏覽器分頁、開啟網頁、切換 App、讀取輔助功能控制項、輸入文字、點擊、按鍵並截取畫面。

`dsh-mac-control` 是原生 macOS DSH 外掛，提供 `mac_browser` 控制 Safari 與 Google Chrome 分頁，並以 `mac_desktop` 操作本機 App、視窗、輔助功能控制項與螢幕截圖。

**運作原理：** 不啟動 HTTP 伺服器、不代理瀏覽器流量，也不儲存憑據。驗證後的要求會交給 `osascript`（JXA/System Events）、`open` 與 `screencapture`，權限仍由 macOS 管理。

**安裝：**

```sh
dsh plugin --profile web add dsh-mac-control
```

重新啟動 web profile，首次使用時核准 macOS 權限。僅接受 `http`/`https` 網址，並禁止傳送密碼、API Key、Cookie 或復原碼。

</details>

## MIT License

This project is released under the [MIT License](LICENSE).
