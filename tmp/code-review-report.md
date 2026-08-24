# vscode-components コードレビュー・動作確認レポート

- **実施日**: 2026-08-24
- **対象**: `main` ブランチ HEAD `2a9770f`(Merge pull request #20 from himadajin/prepack)
- **対象範囲**: `packages/vscode-components`(ライブラリ全 25 コンポーネント + hooks + theme + ビルド/パッケージング)、`apps/vscode-components-preview`(VS Code 拡張)
- **手法**: 静的コードレビュー(10 領域に分割し全件を敵対的検証で裏取り)+ 実ブラウザでの動作確認(全 113 ストーリー × ダーク/ライト)+ インタラクションテスト + npm パッケージ消費テスト + スクリーンショット 226 枚の目視比較。詳細は末尾「検証方法」参照。
- **生データ**: 全指摘の機械可読データは [`tmp/findings.json`](./findings.json)

---

## 1. エグゼクティブサマリ

ビルド・型チェック・整形・Storybook・パッケージングは**すべて成功**し、全ストーリーがランタイムエラーなしに描画され、基本操作(チェック、タブ切替、リスト編集の追加/編集/キャンセル等)も動作します。土台は堅実です。

一方でコードレビューでは **136 件**(critical 5 / major 56 / minor 58 / info 17)、スクリーンショット比較でさらに約 20 件(コードレビューと重複しない視覚問題)の指摘が確定しました。構造的な問題は次の 4 つに集約されます。

1. **React の controlled コンポーネント契約違反が Web Component ラッパー全般に共通**(Checkbox / Select / MultiSelect / Tabs / SplitLayout)。親が値の変更を拒否しても UI が巻き戻らないことを実ブラウザで確認済み。バリデーションや確認ダイアログを挟む用途で確実に壊れます。
2. **キーボード操作・アクセシビリティの欠陥が集中**。RadioGroup の矢印キーは設計レベルで破綻しており、ListEditor / ObjectEditor の並べ替えにはキーボード代替がなく(WCAG 2.1.1 違反)、Tree のインラインアクションは「不可視のままフォーカス可能」です。
3. **VS Code 本家との相違が体系的**。フォント指定がホスト依存(VS Code webview 以外ではセリフ体で表示)、配色は旧 Dark+ と現行 Dark Modern が混在、角丸 4px(本家 2px)・フォント 12px 固定(本家 13px/変数)・CSS 変数名の綴り間違い(`--vscode-treeIndentGuidesStroke` 等)など。
4. **Tree の既定動作が本家と逆**(行クリック展開が無効・インデントガイド非表示)。

| 領域                   | 件数    | 内訳(crit/maj/min/info) | 主なテーマ                                  |
| ---------------------- | ------- | ----------------------- | ------------------------------------------- |
| Web Component ラッパー | 21      | 0/5/10/6                | controlled 契約、イベント購読、API 公開漏れ |
| フォームグループ       | 17      | 1/7/8/1                 | RadioGroup キーボード、label 関連付け       |
| テキスト入力           | 20      | 0/6/10/4                | onChange 二重発火、autosize、disabled       |
| ボタン・アイコン等     | 17      | 0/8/8/1                 | 角丸 0 バグ、icon-only 不可、ProgressRing   |
| List/Object エディタ   | 21      | 1/12/8/0                | Enter バブリング、編集状態管理、DnD         |
| レイアウト・データ表示 | 9       | 0/7/2/0                 | Tree キーボード、Table ARIA、Collapsible    |
| プレビュー拡張         | 7       | 0/2/4/1                 | vsce ビルド漏れ、無音失敗、disposable 蓄積  |
| パッケージング         | 8       | 0/1/4/3                 | バンドル戦略、ESM-only、sideEffects         |
| テーマ忠実度           | 8       | 1/4/2/1                 | 変数名 typo、Dark Modern 乖離               |
| アクセシビリティ横断   | 8       | 2/4/2/0                 | 不可視フォーカス、DnD 代替なし              |
| **合計**               | **136** | **5/56/58/17**          |                                             |

---

## 2. 動作確認の結果(すべて実施済み・エビデンスあり)

| 項目                                                                                                                                                                                                                                                        | 結果                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `npm run check`(ESLint / `tsc --noEmit` ×2 / Prettier)                                                                                                                                                                                                      | ✅ PASS                                                                                                             |
| ライブラリビルド(`tsc -p tsconfig.build.json` + `vite build`)                                                                                                                                                                                               | ✅ PASS(dist/index.js 328KB / styles.css 28KB)                                                                      |
| 拡張ビルド(vite webview + esbuild extension)                                                                                                                                                                                                                | ✅ PASS                                                                                                             |
| Storybook 静的ビルド                                                                                                                                                                                                                                        | ✅ PASS                                                                                                             |
| `npm publish --dry-run`                                                                                                                                                                                                                                     | ✅ PASS(89.6KB / 140 files)                                                                                         |
| **パッケージ消費テスト**: `npm pack` した tarball を新規 Vite + React 19 アプリにインストールしてビルド                                                                                                                                                     | ✅ PASS。`styles.css` / `theme/defaults.css` の import、codicon.ttf の解決・出力も正常                              |
| **スモークテスト**: 全 113 ストーリー × dark/light = 226 ページを headless Chromium で描画                                                                                                                                                                  | ✅ 全ページ描画成功・ランタイムエラー / React エラー 0 件                                                           |
| **インタラクションテスト**: Checkbox トグル / Tabs クリック切替 / Collapsible クリック・Enter トグル / ListEditor 編集(Enter コミット)・Escape キャンセル・空値 Add 拒否 / ObjectEditor 追加(キー・値入力 → Enter) / Select・MultiSelect ドロップダウン開閉 | ✅ いずれも期待通り動作                                                                                             |
| **controlled 拒否テスト**: 親が `checked={false}` / `value="off"` を固定した状態でユーザー操作                                                                                                                                                              | ❌ **失敗**。Checkbox は `checked=true`、Select は `value="auto"` のまま巻き戻らない(→ 問題 #1)。TextInput のみ正常 |
| **Tree 行クリック展開**                                                                                                                                                                                                                                     | ❌ 本家(既定 singleClick)と異なり、行クリックでは展開が切り替わらない(→ 問題 #4)                                    |

注: スモークテストは React の**本番ビルド**に対するもので、開発時のみの React 警告(後述 TI-02 など)は検出対象外です。

---

## 3. 最重要問題(詳細)

### #1 [critical 相当 / bug] controlled コンポーネント契約違反 — ラッパー全般

`packages/vscode-components/src/components/Checkbox/Checkbox.tsx:33` ほか(Select.tsx:35 / MultiSelect.tsx / Tabs.tsx:35 / SplitLayout.tsx)

各ラッパーは Web Component の状態を `useEffect(..., [prop値])` で同期しています。上流の `vscode-checkbox` はクリック時に内部で `this.checked = !this.checked` してから `change` を発火するため、**親が onChange で更新を拒否した場合**(バリデーション・確認ダイアログ等)、prop 値が変わらず effect が再実行されず、React の差分検出でも書き戻されず、**UI が props と乖離したまま**になります。

**実機確認済み**: 親が `checked={false}` を固定 → クリック後の要素は `checked=true`。親が `value="off"` を固定 → 選択後 `value="auto"`。

**修正案**: change イベントハンドラ内で controlled の場合に `element.checked = checked` 等を即時再アサートする(全ラッパーで方針統一)。

関連バグ(同じ同期設計に起因):

- **SEL-01 [major]**: Select は uncontrolled の選択を state で追跡しないため、`enum` の変化(項目追加など)でユーザー選択が defaultValue / 先頭値へ silent に巻き戻る。
- **CHK-02 [minor]**: `defaultChecked` が paint 後の effect 適用のため初回フラッシュし、上流の `default-checked` 属性 / form reset 復元も効かない。
- **TABS-01 [minor]**: `defaultSelectedIndex` が「初回のみ」でなく変化のたびにユーザーのタブ選択を上書き。
- **Collapsible.tsx:40 [major]**: `defaultOpen` も同様に、変化するたびに非制御状態を上書きする(React の default\* 慣習違反)。

### #2 [critical / bug] RadioGroup の矢印キーナビゲーションが設計レベルで破綻

`packages/vscode-components/src/components/Radio/Radio.tsx:125` + `RadioGroup.tsx:85`

矢印キー処理はまず**現在の** radio に `group.selectValue(value, { focus: true })` を呼び、その後に次の radio へ `click() + focus()` します。`focusRadio` は `requestAnimationFrame` で遅延フォーカスするため、**次フレームで元の radio がフォーカスを奪い返し**ます。結果: 選択は B に移るがフォーカスは A に戻り、roving tabindex が乖離、次の矢印キーで選択が A に巻き戻り、1 キー押下で onChange が 2 回発火するケースもあります(検証エージェントがコードトレースで確認)。

さらに:

- **RADIO-02 [major]**: `value` の既定が `''` のため、value 未指定の Radio 同士が衝突し**複数チェック表示**になり、レジストリ(value キーの Map)も相互上書きされる。
- **RG-002 [major]**: 選択中 radio が disabled になる/消えるとグループ全体が Tab 到達不能。
- **RG-003 [major]**: グループ name が render 中の `Math.random()` 依存。

**修正案**: WAI-ARIA パターン通り「フォーカス移動先を選択」に一本化し、radio の識別に `useId` ベースの一意 ID を使う。

### #3 [critical / bug] エディタ群の編集フロー: Enter バブリングによる即時/stale コミット

`packages/vscode-components/src/components/shared/collectionEditor.tsx:95`

enum 項目の編集時、`vscode-single-select` 内での Enter(ドロップダウン確定)が親の `onKeyDown` にバブルし、**選択確定と同時に行コミットが走る**、あるいは draft 反映前の**古い値でコミット**されます。ほか編集フロー全般に:

- **CE-02 [major]**: Add Item が値を即時コミットするため、Cancel/Escape しても空アイテムが残る(VS Code はコミット前に編集行を出すだけ)。※実機テストでは「新規行の Escape で行が残らない」ことを確認したが、これは onChange 済み配列が親 state に入った後に削除される実装で、コミット→巻き戻しの挙動自体は残存。
- **CE-03 [major]**: Cancel で破棄した draft が次回編集時に復活。
- **CE-04 [major]**: 行の削除・並べ替えに `editingIndex` が追従せず、編集 UI が別の行に移る。
- **CE-05 [major]**: ObjectEditor でキー重複コミットが既存エントリを無警告上書き。空キー・`__proto__` も許容。
- **CE-08/09/10 [major]**: 下方向ドラッグでインジケータと挿入位置が食い違う / 編集中の行もドラッグ可能でテキスト選択がドラッグに化ける / 外部からのドロップ(任意のテキスト)で誤並べ替え。
- **CE-11 [major]**: スキーマ制約(pattern/min/max 等)が一切検証されず、number 編集で `''` や NaN が配列に混入。

### #4 [critical / bug+fidelity] Tree: CSS 変数名の綴り間違いと本家と逆の既定値

`packages/vscode-components/src/components/Tree/Tree.module.css:74` / `Tree.tsx:213-214` / `theme/defaults.css:59`

- 実在する VS Code 変数は `--vscode-tree-indentGuidesStroke` / `--vscode-tree-inactiveIndentGuidesStroke` / `--vscode-list-focusOutline` ですが、本実装は **`--vscode-treeIndentGuidesStroke` / `--vscode-treeInactiveIndentGuidesStroke` / `--vscode-listFocusOutline`**(ハイフン抜け)を参照。defaults.css も同じ誤名で定義しているため Storybook では整合して見えるが、**実際の VS Code webview ではテーマ値を一切受け取れません**(microsoft/vscode `listColors.ts` および vscode-elements の css-custom-data で裏取り済み)。`--vscode-tree-background` は実在しない変数です。
- 既定値が本家と逆: `expandOnlyOnTwistieClick = true`(本家 `workbench.tree.expandMode` 既定は singleClick =「行クリックで展開」)、`renderIndentGuides = 'none'`(本家既定は onHover)。**行クリックで展開しないことは実機で確認済み**。
- **tree-keyboard-bypasses-disabled [major]**: クリックは `item.disabled` でブロックされるが、Enter/Space/矢印キーは `handleSelect` / `toggleExpanded` に直達し disabled を迂回。
- **tree-twistie-missing-for-lazy-children [major]**: `collapsible: true` でも children が空だとシェブロンが描画されず、遅延ロードパターンが成立しない。
- Home/End キー未対応(本家は対応)[major]。

### #5 [critical / a11y] 不可視フォーカスとキーボード代替の欠如

- **Tree インラインアクション**(`Tree.tsx:785`): ツリーは aria-activedescendant 型(タブストップ 1 個)なのに、`item.actions` のネイティブ button が tabIndex=0 のまま DOM に残り、**opacity:0 で不可視のままタブ順序に入ります**。キーボードユーザーは見えないボタンにフォーカスして操作できてしまう。
- **ListEditor / ObjectEditor の並べ替え**(`useDragReorder.ts:19`): HTML5 DnD のみで**キーボード代替が存在せず**、`reorderable` 機能そのものがキーボードから到達不能(WCAG 2.1.1 違反)。
- **編集開始/終了時のフォーカス管理皆無**(`ListEditorRow.tsx:30` [major]): Edit ボタン押下で当該ボタンが DOM から消え、フォーカスが body に落ちる。入力への autoFocus もない。
- **FormGroup の label 関連付けが group に効かない**(`FormGroup.tsx:58` [major]): `<label htmlFor>` は labelable 要素前提のため、CheckboxGroup / RadioGroup(`role="group"` の div)にはアクセシブルネームが付与されない。CheckboxGroup 側は props 展開後に `aria-describedby` を上書きして FormGroup の注入を握り潰す(CG-002)。
- **Table**: 選択状態が `aria-selected` なしの背景色のみ [major]、`role="table"` なのに roving tabindex + 矢印キー移動という対話的グリッド実装で SR のブラウズモードと衝突 [major]。

### #6 [major / design] フォント指定がホスト依存 — VS Code webview 以外ではセリフ体

`packages/vscode-components/src/theme/*.css` + 各 module.css

`body` に font-family を設定する仕組みがどこにもなく、コンポーネント側の `font-family: var(--vscode-font-family)` も部分的(Button / TextInput / Radio 等のみ。**Label / Tree / Table / ListEditor 行 / FormGroup 等は未指定**)。VS Code webview は本体が body へフォントを注入するため気づきませんが、**Storybook を含む通常のブラウザ環境では明朝系(セリフ)で描画されます**。今回取得した 226 枚のスクリーンショット全てで再現(例: [images/serif-font-issue-dark.png](./images/serif-font-issue-dark.png)、[images/tree-explorer-dark.png](./images/tree-explorer-dark.png))。

**修正案**: ルート要素(または各コンポーネントの root クラス)で `font-family: var(--vscode-font-family, <sans フォールバック>); font-size: var(--vscode-font-size, 13px)` を一括適用する。

### #7 [major / bug] useWebComponentEvent: handler が初期 undefined だと購読が永久に行われない

`packages/vscode-components/src/hooks/useWebComponent.ts:40`

購読 effect は `if (!element || !handlerRef.current) return;` で早期 return しますが、依存配列に handler が含まれないため、**handler が後から渡されてもリスナーが登録されません**。公開 API(`src/index.ts` で export)なので、利用者が getPayload を安定化して使うと確実に踏みます。修正は早期 return から `handlerRef.current` 条件を外すだけ(発火時チェックは既にある)。併せて `mergeRefs` の React 19 ref cleanup 非対応(HOOK-03)、毎レンダー再購読(HOOK-02)も要対応。

### #8 [major / bug] TextInput: onChange が 1 打鍵ごとに 2 回発火

`packages/vscode-components/src/components/TextInput/TextInput.tsx:58-59`

`onInput` と `onChange` の両方から同一コールバックを呼んでいます。React の `onChange` は native `input` イベントで発火するため**常に二重発火**します。また `value` と `defaultValue` を無条件に両方 DOM へ転送しており、Controlled ストーリーは meta.args の `defaultValue: 'Preview'` を継承するため開発モードで React 警告が出ます(TI-02。本番ビルドの Storybook では警告が出ないことも確認済み)。invalid 状態を API から設定できない点(TI-03)、`height: 24px` が内容合計 26px と矛盾しテキストが潰れる点(TI-05)も。

### #9 [major / bug] Textarea: 自動リサイズ実装の複合的な問題

`packages/vscode-components/src/components/Textarea/`

- **TA-01**: disabled の視覚表現が皆無(`.root.disabled { opacity: 1 }` が減光を明示的に打ち消し、`.input:disabled` はカーソルのみ)。上流は opacity 0.4。**スクリーンショットでも通常状態とピクセル同一なことを確認**。
- **TA-04**: `resize` prop による手動リサイズが毎レンダーの height 同期で即座に巻き戻る。
- **TA-05**: 高さ計測用ミラー要素に border がなく実測が 2px ずれ、折り返し不一致・最終行欠けが起き得る。
- **TA-07**: コンテナ幅の変化(window resize 以外)で再計算されず、overflow hidden のためテキストが不可視になり得る。
- **TA-02**: invalid + focus 時に青の focusBorder が赤のエラーボーダーを上書き(上流と逆)。

### #10 [major / bug+fidelity] ToolbarButton / Icon / ProgressRing

- **TBB-001 + corner-radius-medium-no-fallback**: `border-radius: var(--vscode-cornerRadius-medium)` はフォールバックがなく defaults.css にも未定義のため**常に 0 に解決**(ToolbarButton.module.css:5、Icon.module.css:19)。本家のトークン既定値は 6px。
- **TBB-002**: `label` prop が必ず可視テキストになるため、**アクセシブルネーム付きの icon-only ボタンが作れない**(icon-only は children も label もない場合のみ → その場合 aria-label が undefined)。IconOnly ストーリー自体が label を渡しており実際はテキスト表示になっている(スクリーンショット確認済み)。
- **ICO-001/002**: Icon の `spin` が sync/loading/gear 以外で無効。`actionIcon` なしでは `onClick` が黙って無視される。
- **PR-001**: ProgressRing は名前に反して**円形スピナーではなく VS Code の水平プログレスバー移植**(monaco progress bit)。設定項目内では孤立した十数 px の青線に見える([images/progressring-bar-dark.png](./images/progressring-bar-dark.png))。`value=0` が `Math.max(1,...)` で 1 に切り上げられ 0% を表現できない、`style` prop がルートでなく内部要素に適用される(PR-002)も。

### #11 [major / fidelity] テーマ配色・メトリクスの本家乖離(体系的)

`packages/vscode-components/src/theme/defaults.css` ほか

- **配色の新旧混在**: editor-background `#1f1f1f` や input `#313131` は現行 Dark Modern 値だが、`button-background: #0e639c`(旧 Dark+。Dark Modern は `#0078d4`)、`focusBorder: #007fd4`(同 `#0078d4`)、`badge-background: #4d4d4d`(同 `#616161`)などが旧値・ベースレジストリ値のまま(microsoft/vscode `dark_modern.json` と照合済み)。light の button `#0078d4` も Light Modern の `#005fb8` と不一致。
- **`list.hoverBackground` を半透明 rgba オーバーレイで定義**(本家は単色 `#2A2D2E` / `#F0F0F0`)— 下地により見え方が変わる。
- **font-size 12px 固定**(Button / ListEditor / ObjectEditor のボタン類。本家は `var(--vscode-font-size)` = 13px)。
- **border-radius 4px**(Button / TextInput / エディタ類。本家・上流 vscode-elements は 2px)。
- **ハイコントラスト(hc-dark / hc-light)非対応**(defaults.css に切替経路がない)。
- **Select の幅**: `width: min(320px, 100%)` は shrink-to-fit 親で内容幅まで潰れ、シェブロンがテキストに重なる([images/select-width-collapse-dark.png](./images/select-width-collapse-dark.png))。本家設定エディタは 320px 固定。

### #12 [major] プレビュー拡張・パッケージング

- **F1 [major]**: `vscode:prepublish` スクリプトがなく、`vsce package` 時に dist のビルドが自動実行されない(古い成果物が VSIX に入り得る)。
- **F2 [major]**: webview アセット欠落時のエラー検知がなく無音で真っ白(存在チェックなし、script 読み込み失敗時のフォールバックなし)。
- **F6 [minor]**: パネルを開き直すたびに `context.subscriptions` へ disposable が蓄積(パネル単位の disposable 配列を使う公式パターンと乖離)。
- **vscode-elements-not-externalized [major]**: `@vscode-elements/elements` が external 指定されず **dist/index.js に丸ごとバンドル**(328KB)。dependencies 宣言と二重になっており、利用側が別途 vscode-elements を読み込むと二重ロード・カスタム要素二重登録のリスク。※消費テスト(単独利用)ではビルド・実行とも問題なし。
- **esm-only-no-cjs [minor]**: exports に require 条件がなく、CJS からの `require()` は `ERR_PACKAGE_PATH_NOT_EXPORTED` で失敗(実験で確認済み)。意図的なら README への明記を推奨。
- **missing-sideeffects-field [minor]**: `sideEffects` 未宣言。将来 `false` を安易に足すとカスタム要素登録と codicon CSS が tree-shake され壊れる。
- **npm パッケージに README が同梱されない**(files: dist, LICENSE のみ、パッケージ dir に README 不在)— npmjs.com 上で説明が表示されない。
- **bare-react-namespace-dts [minor]**: 公開 .d.ts が裸の `React.*` 名前空間参照に依存し、環境によって型解決に失敗し得る。

---

## 4. 全指摘一覧(コードレビュー 136 件)

凡例: 重大度 C=critical / M=major / m=minor / i=info。全件が敵対的検証エージェントによる裏取りで confirmed。詳細・根拠・修正案は `tmp/findings.json` を参照。

### Web Component ラッパー(21 件)

| ID       | 重大度 | 分類     | 位置                                                     | 指摘                                                                                                                                   |
| -------- | ------ | -------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| HOOK-01  | M      | bug      | `…/hooks/useWebComponent.ts:40`                          | useWebComponentEvent: handler が初期 undefined だとリスナーが永久に登録されない                                                        |
| RADIO-01 | M      | bug      | `…/components/Radio/Radio.tsx:125`                       | Radio: 矢印キー操作で requestAnimationFrame により前の radio へフォーカスが奪い返される                                                |
| RADIO-02 | M      | bug      | `…/components/Radio/Radio.tsx:54`                        | Radio: value のデフォルト '' により value 未指定 radio 同士が衝突し複数チェック表示になる                                              |
| CHK-01   | M      | bug      | `…/components/Checkbox/Checkbox.tsx:37`                  | Checkbox: controlled の checked / indeterminate が強制されず DOM と props が乖離する(Select/MultiSelect/Tabs/SplitLayout も同パターン) |
| SEL-01   | M      | bug      | `…/components/Select/Select.tsx:33`                      | Select: uncontrolled の選択状態を追跡しないため、enum 変更時にユーザー選択が defaultValue へ巻き戻る                                   |
| CHK-02   | m      | bug      | `…/components/Checkbox/Checkbox.tsx:45`                  | Checkbox: defaultChecked が post-paint effect 適用のため初回フラッシュし、form reset でも復元されない                                  |
| MS-01    | m      | bug      | `…/components/MultiSelect/MultiSelect.tsx:87`            | MultiSelect: disabled/label/combobox 等を paint 後の effect でのみ適用するため初回フラッシュと SSR 欠落が起きる                        |
| TABS-01  | m      | bug      | `…/components/Tabs/Tabs.tsx:33`                          | Tabs: defaultSelectedIndex が初回限定でなく、後から変わるとユーザーのタブ選択を強制上書きする                                          |
| HOOK-02  | m      | design   | `…/hooks/useWebComponent.ts:56`                          | useWebComponentEvent: 全呼び出し元がインライン getPayload を渡すため毎レンダーで解除/再登録が発生                                      |
| HOOK-03  | m      | bug      | `…/hooks/useWebComponent.ts:9`                           | mergeRefs: React 19 の ref cleanup 関数非対応かつ毎レンダー新規生成で null/要素の再呼び出しが起きる                                    |
| TB-01    | m      | a11y     | `…/components/ToolbarContainer/ToolbarContainer.tsx:61`  | ToolbarContainer: roving tabindex が毎レンダーで先頭ボタンへリセットされる                                                             |
| TB-02    | m      | a11y     | `…/components/ToolbarContainer/ToolbarContainer.tsx:193` | ToolbarContainer: vertical 時に aria-orientation が設定されない                                                                        |
| SEL-02   | m      | fidelity | `…/components/Select/Select.tsx:76`                      | Select: enumDescriptions を vscode-option の description ではなく title 属性で渡している                                               |
| CHK-03   | m      | design   | `…/components/Checkbox/Checkbox.tsx:68`                  | Checkbox: toggle prop が何の効果も持たないデッド API                                                                                   |
| DTS-01   | m      | bug      | `…/types/web-components.d.ts:24`                         | web-components.d.ts: vscode-option の要素型が HTMLOptionElement で不正確                                                               |
| CHK-04   | i      | design   | `…/components/Checkbox/Checkbox.tsx:4`                   | Checkbox: upstream のフォーム関連 API(name/value/required/invalid 等)が公開されていない                                                |
| MS-02    | i      | design   | `…/components/MultiSelect/MultiSelect.tsx:126`           | MultiSelect: value→internalValue ミラー effect による余分な再レンダーと、filter/position/name の未公開                                 |
| SEL-03   | i      | design   | `…/components/Select/Select.tsx:72`                      | Select: enum の重複値で React key が衝突、および upstream 属性(name/required/invalid 等)の未公開                                       |
| TB-03    | i      | bug      | `…/components/ToolbarContainer/ToolbarContainer.tsx:123` | ToolbarContainer: 要素以外の children が silent に破棄され、role 判定が null 要素を数えている                                          |
| DTS-02   | i      | docs     | `…/types/web-components.d.ts:55`                         | web-components.d.ts: tab-id は vscode-tabs が内部管理する属性で、宣言がユーザーの誤用を誘う(その他の属性欠落も)                        |
| RADIO-03 | i      | fidelity | `…/components/Radio/Radio.tsx:174`                       | Radio: upstream の vscode-radio をラップせず独自実装しており、他コンポーネントと非対称                                                 |

### フォームグループ(17 件)

| ID     | 重大度 | 分類     | 位置                                                    | 指摘                                                                                                                           |
| ------ | ------ | -------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| RG-001 | C      | bug      | `…/components/RadioGroup/RadioGroup.tsx:85`             | RadioGroup の矢印キーナビゲーションが破綻している(rAF によるフォーカス奪還で選択がピンポンする)                                |
| RG-002 | M      | bug      | `…/components/RadioGroup/RadioGroup.tsx:123`            | tabIndexFor: 選択中の radio が disabled または DOM から消えるとグループ全体が Tab 到達不能になる                               |
| FG-001 | M      | a11y     | `…/components/FormGroup/FormGroup.tsx:63`               | FormGroup: 子要素が独自の id を持つと Label の htmlFor と食い違い、ラベル関連付けが壊れる                                      |
| FG-002 | M      | a11y     | `…/components/FormGroup/FormGroup.tsx:47`               | FormGroup: helper 要素が独自の id を持つと aria-describedby が存在しない id を参照する                                         |
| FG-003 | M      | a11y     | `…/components/FormGroup/FormGroup.tsx:61`               | FormGroup: RadioGroup/CheckboxGroup/ラッパー div 等の label 不可能な子には htmlFor が無効で、アクセシブルネームが付与されない  |
| RG-003 | M      | bug      | `…/components/RadioGroup/RadioGroup.tsx:60`             | RadioGroup: name の生成が render 中の Math.random 依存で、name prop の後からの変更も無視される                                 |
| CG-001 | M      | design   | `…/components/CheckboxGroup/CheckboxGroup.tsx:15`       | CheckboxGroup と RadioGroup の API 設計が非対称で、upstream の vscode-checkbox-group とも大きく乖離                            |
| CG-002 | M      | a11y     | `…/components/CheckboxGroup/CheckboxGroup.tsx:152`      | CheckboxGroup: props スプレッド後に aria-describedby/role を上書きしており、FormGroup が注入する説明文の関連付けが握り潰される |
| CG-003 | m      | a11y     | `…/components/CheckboxGroup/CheckboxGroup.tsx:151`      | CheckboxGroup: role=group への aria-invalid は非準拠、validation メッセージも読み上げ通知されない                              |
| CG-004 | m      | a11y     | `…/components/CheckboxGroup/CheckboxGroup.tsx:168`      | CheckboxGroup: item.key をそのまま id に埋め込むため、空白等を含む key で aria-labelledby が壊れる                             |
| CG-005 | m      | fidelity | `…/components/CheckboxGroup/CheckboxGroup.tsx:132`      | CheckboxGroup: ラベルの mousedown トグル(右クリック含む)と Enter トグルがネイティブのチェックボックス操作semanticsから乖離     |
| RG-004 | m      | bug      | `…/components/RadioGroup/RadioGroup.tsx:146`            | RadioGroup: cloneElement による data-radio-index 注入は Fragment/ラッパーで壊れ、レジストリも value 重複で衝突する             |
| FH-001 | m      | a11y     | `…/components/FormHelper/FormHelper.tsx:35`             | FormHelper: 静的表示でも warning/error が role=alert + aria-live=assertive になり過剰通知、既定トーンにも不要な live region    |
| FC-001 | m      | fidelity | `…/components/FormContainer/FormContainer.module.css:1` | FormContainer/FormGroup: upstream の max-width 727px に相当する幅制限がなく、ワイド画面で行が全幅に伸びる                      |
| LB-001 | m      | fidelity | `…/components/Label/Label.tsx:3`                        | Label: upstream vscode-label の required インジケーターに相当する機能がない                                                    |
| LB-002 | m      | bug      | `…/components/Label/Label.module.css:5`                 | Label: .title の text-overflow: ellipsis は white-space 指定がなく機能しない(ストーリーが検証を謳う ellipsis が出ない)         |
| ST-001 | i      | docs     | `…/components/Label/Label.stories.tsx:7`                | Storybook のカテゴリ命名が不統一(Forms/Label・Form/\*・Primitives/RadioGroup)                                                  |

### テキスト入力(20 件)

| ID     | 重大度 | 分類     | 位置                                              | 指摘                                                                                                              |
| ------ | ------ | -------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| TI-01  | M      | bug      | `…/components/TextInput/TextInput.tsx:58`         | onInput と onChange の二重登録で onChange コールバックが 1 打鍵ごとに 2 回発火する                                |
| TI-03  | M      | design   | `…/components/TextInput/TextInput.tsx:4`          | invalid 状態を API から設定できない(CSS の .invalid クラスが到達不能)、vscode-textfield との API ギャップ         |
| TA-01  | M      | fidelity | `…/components/Textarea/Textarea.module.css:14`    | disabled 状態に視覚的表現が一切なく、upstream の opacity 0.4 / cursor not-allowed と乖離                          |
| TA-04  | M      | bug      | `…/components/Textarea/Textarea.tsx:115`          | resize prop によるユーザーの手動リサイズが毎レンダーの height 同期で即座に巻き戻される                            |
| TA-05  | M      | bug      | `…/components/Textarea/Textarea.module.css:27`    | ミラー要素に border がなく実測が 2px ずれる: 折り返し位置の不一致と最終行の欠けが発生し得る                       |
| TA-07  | M      | bug      | `…/components/Textarea/Textarea.tsx:119`          | コンテナ幅の変化(window resize 以外)で高さが再計算されず、overflow hidden のためテキストが不可視になる            |
| TI-02  | m      | bug      | `…/components/TextInput/TextInput.tsx:47`         | value と defaultValue を両方 DOM に転送しており、併用時に React 警告が出る(Controlled ストーリーで実際に発生)     |
| TI-04  | m      | design   | `…/components/TextInput/TextInput.tsx:13`         | type='integer' が number と同一挙動で整数を強制しない/upstream が対応する password 等の型を表現できない           |
| TI-05  | m      | fidelity | `…/components/TextInput/TextInput.module.css:4`   | height: 24px が padding+line-height+border の合計 26px と矛盾し、テキストが 2px 分押し潰される                    |
| TI-06  | m      | fidelity | `…/components/TextInput/TextInput.module.css:12`  | border-radius: 4px は VS Code / vscode-elements の 2px と不一致(TextInput・Textarea 共通)                         |
| TI-07  | m      | bug      | `…/components/TextInput/TextInput.module.css:62`  | .number の min-width: 200px が width: min(200px, 100%) の縮小意図を打ち消し、狭いコンテナで水平オーバーフローする |
| TI-08  | m      | design   | `…/components/TextInput/TextInput.module.css:7`   | CSS 変数フォールバック欠如: テーマ CSS 未読込環境で border/背景が完全に消える(Textarea とは方針不一致)            |
| TA-02  | m      | bug      | `…/components/Textarea/Textarea.module.css:48`    | invalid かつ focus 時に focusBorder(青)がエラーボーダー(赤)を上書きする(upstream と逆)                            |
| TA-03  | m      | bug      | `…/components/Textarea/Textarea.tsx:184`          | 利用者が渡した style prop が {...props} 展開後の style={{ resize }} に黙って上書き・破棄される                    |
| TA-06  | m      | bug      | `…/components/Textarea/Textarea.tsx:28`           | rows 指定時の最小行数パディングが論理行のみを数え、折り返し行を無視して高さが過大になる                           |
| TA-08  | m      | fidelity | `…/components/Textarea/Textarea.module.css:52`    | スクロールバーを完全非表示にしており、upstream のテーマ付きスクロールバー/スクロールシャドウと乖離                |
| TA-09  | i      | fidelity | `…/components/Textarea/Textarea.tsx:165`          | cols prop を受け付けるが CSS の width: 100% に常に上書きされ、視覚上まったく効果がない                            |
| IME-01 | i      | docs     | `…/hooks/useImeGuard.ts:1`                        | useImeGuard.ts はフック命名だが実体はプレーン関数(公開 API としての命名齟齬)                                      |
| IME-02 | i      | bug      | `…/hooks/useImeGuard.ts:7`                        | Android ソフトキーボードでは非 IME 入力でも keyCode 229 が報告され、Enter コミットが常時抑止される可能性          |
| TI-09  | i      | docs     | `…/components/TextInput/TextInput.stories.tsx:18` | TextInput のストーリーが disabled / readOnly / invalid / pattern をカバーしていない                               |

### ボタン・アイコン等(17 件)

| ID      | 重大度 | 分類     | 位置                                                     | 指摘                                                                                                                   |
| ------- | ------ | -------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| TBB-001 | M      | bug      | `…/components/ToolbarButton/ToolbarButton.module.css:5`  | 未定義の CSS 変数 --vscode-cornerRadius-medium により border-radius が 0 になる                                        |
| BG-001  | M      | fidelity | `…/components/ButtonGroup/ButtonGroup.tsx:12`            | ButtonGroup が upstream vscode-button-group(split button)と別物になっている                                            |
| BG-002  | M      | a11y     | `…/components/ButtonGroup/ButtonGroup.tsx:17`            | ButtonGroup が role=group なのに roving tabindex で Tab 到達を 1 個に制限している                                      |
| TBB-002 | M      | a11y     | `…/components/ToolbarButton/ToolbarButton.tsx:31`        | ToolbarButton の label が可視テキストになり、icon-only ボタンに accessible name を付けられない                         |
| ICO-001 | M      | bug      | `…/components/Icon/Icon.tsx:97`                          | Icon の spin プロパティが sync / loading / gear 以外のアイコンでは無効                                                 |
| ICO-002 | M      | bug      | `…/components/Icon/Icon.tsx:108`                         | actionIcon なしの Icon では onClick が黙って無視される                                                                 |
| PR-001  | M      | fidelity | `…/components/ProgressRing/ProgressRing.tsx:14`          | ProgressRing はリング(スピナー)ではなく水平プログレスバーを描画する                                                    |
| PR-002  | M      | bug      | `…/components/ProgressRing/ProgressRing.tsx:72`          | ProgressRing の style prop がルートではなく内部の .bit 要素に適用される                                                |
| BTN-001 | m      | fidelity | `…/components/Button/Button.module.css:9`                | Button の border-radius が 4px(VS Code 本家/upstream は 2px)                                                           |
| BTN-002 | m      | fidelity | `…/components/Button/Button.module.css:13`               | Button の font-size 12px 固定・横 padding 8px が upstream(13px / 13px)と乖離                                           |
| BTN-003 | m      | bug      | `…/components/Button/Button.module.css:47`               | disabled な Button にも hover 背景色が適用される                                                                       |
| TBB-003 | m      | fidelity | `…/components/ToolbarButton/ToolbarButton.module.css:51` | ToolbarButton の checked 状態: hover で背景が消える・activeForeground/Border 未実装・toggleable なしでは ARIA に出ない |
| ICO-003 | m      | a11y     | `…/components/Icon/Icon.tsx:91`                          | actionIcon で label 未指定だと accessible name のないボタンになる(label は装飾モードでは無視)                          |
| ICO-004 | m      | fidelity | `…/components/Icon/Icon.module.css:26`                   | action アイコンのヒットターゲットが 24px(VS Code/upstream は 22px)                                                     |
| BDG-001 | m      | design   | `…/components/Badge/Badge.tsx:5`                         | Badge の variant 型に upstream の 'tab-header-counter' が欠けている                                                    |
| API-001 | m      | design   | `…/components/Button/Button.tsx:15`                      | onClick の型が () => void でイベントオブジェクトが渡らない(Button / ToolbarButton / Icon 共通)                         |
| BTN-004 | i      | design   | `…/components/Button/Button.tsx:48`                      | 汎用 Button が常に data-toolbar-button="true" を DOM に出力する                                                        |

### List/Object エディタ(21 件)

| ID    | 重大度 | 分類     | 位置                                               | 指摘                                                                                                         |
| ----- | ------ | -------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| CE-01 | C      | bug      | `…/components/shared/collectionEditor.tsx:95`      | enum 編集時に Enter キーが vscode-single-select からバブルし、即時コミット/stale draft コミットが発生する    |
| CE-02 | M      | fidelity | `…/components/ListEditor/ListEditor.tsx:129`       | Add Item が値を即時コミットするため、Cancel/Escape 後も空アイテム/デフォルトエントリが残る                   |
| CE-03 | M      | bug      | `…/components/ListEditor/ListEditorRow.tsx:145`    | Cancel で破棄したはずの draft が次回編集時に復活する(editing 遷移時に draft がリセットされない)              |
| CE-04 | M      | bug      | `…/components/ListEditor/ListEditor.tsx:122`       | 行の削除・並べ替え時に editingIndex が追従せず、編集 UI が別の行へ移動/消失する                              |
| CE-05 | M      | bug      | `…/components/ObjectEditor/ObjectEditor.tsx:122`   | ObjectEditor: キー重複コミットで既存エントリを無警告上書き、空キー・'**proto**' キーも許容                   |
| CE-06 | M      | bug      | `…/components/ObjectEditor/ObjectEditor.tsx:174`   | ObjectEditor の Add Item: デフォルト値が「解決後のキー」ではなく「先頭スキーマキー」の schema から計算される |
| CE-07 | M      | bug      | `…/components/ObjectEditor/ObjectEditorRow.tsx:40` | schema.properties があると非スキーマキーの既存エントリが編集不能になる(キー Select に選択肢が無い)           |
| CE-08 | M      | bug      | `…/hooks/useDragReorder.ts:59`                     | 下方向ドラッグ時、ドロップインジケータ(行上端の線)と実際の挿入位置が食い違う                                 |
| CE-09 | M      | bug      | `…/components/ListEditor/ListEditorRow.tsx:152`    | 編集中の行も draggable のままで、編集入力内のマウスによるテキスト選択が行ドラッグに化ける                    |
| CE-10 | M      | bug      | `…/hooks/useDragReorder.ts:45`                     | useDragReorder が外部由来のドロップを受け入れ、別インスタンス/任意テキストのドラッグで誤並べ替えが起きる     |
| CE-11 | M      | fidelity | `…/components/shared/collectionEditor.tsx:77`      | スキーマ制約(pattern/minLength/minimum/maximum)が検証・表示されず、number 編集で '' や NaN が配列に混入する  |
| CE-12 | M      | a11y     | `…/components/ListEditor/ListEditorRow.tsx:45`     | フォーカス管理が皆無: 編集開始/確定/キャンセルのたびにフォーカスが body に落ち、入力への autofocus も無い    |
| CE-13 | M      | a11y     | `…/hooks/useDragReorder.ts:19`                     | 並べ替えがマウス DnD 限定でキーボード代替が無く、リスト/行の ARIA セマンティクスも欠如                       |
| CE-14 | m      | bug      | `…/components/ListEditor/ListEditor.module.css:20` | 編集モードの OK/Cancel ボタンが 46px のアクション列を溢れ、入力欄に重なる(ListEditor)                        |
| CE-15 | m      | bug      | `…/components/shared/collectionEditor.tsx:98`      | Select にフォーカスがあると Escape で編集をキャンセルできない/OK・Cancel ボタン上でも Escape が効かない      |
| CE-16 | m      | bug      | `…/components/shared/collectionEditor.tsx:95`      | Enter コミットで preventDefault/stopPropagation されず、form 内では暗黙 submit が併発する                    |
| CE-17 | m      | bug      | `…/components/ListEditor/ListEditor.tsx:48`        | index ベースの key により削除・並べ替えで後続行が全て remount され、フォーカスとローカル state が破棄される  |
| CE-18 | m      | fidelity | `…/components/ObjectEditor/ObjectEditor.tsx:124`   | ObjectEditor: キーを改名すると行が末尾へジャンプし、数値風キーは先頭に並び替わる                             |
| CE-19 | m      | bug      | `…/hooks/useDragReorder.ts:29`                     | ドラッグ離脱時のインジケータ残留と、ドラッグ開始直後に自行へインジケータが出る                               |
| CE-20 | m      | docs     | `…/components/ListEditor/ListEditor.tsx:14`        | 宣言のみで機能しない API / デッドコード(addPlaceholder、ListChangeEventType 'reset'、styles.empty ほか)      |
| CE-21 | m      | a11y     | `…/components/ObjectEditor/ObjectEditorRow.tsx:99` | 編集フォームの入力にアクセシブルネームが無く、OK ボタンの aria-label が可視ラベルと不一致                    |

### レイアウト・データ表示(9 件)

| ID                                            | 重大度 | 分類     | 位置                                          | 指摘                                                                                                         |
| --------------------------------------------- | ------ | -------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| tree-home-end-missing                         | M      | fidelity | `…/components/Tree/Tree.tsx:507`              | Tree に Home/End キーボードナビゲーションが実装されていない                                                  |
| tree-keyboard-bypasses-disabled               | M      | bug      | `…/components/Tree/Tree.tsx:424`              | Tree のキーボード操作が disabled 項目のガードを迂回できる                                                    |
| tree-css-var-typo                             | M      | bug      | `…/components/Tree/Tree.module.css:74`        | Tree.module.css が実際の VS Code CSS 変数名と異なる名前を参照しておりテーマ連携が壊れる                      |
| tree-twistie-missing-for-lazy-children        | M      | bug      | `…/components/Tree/Tree.tsx:771`              | children が未設定/空でも collapsible=true な項目でツイスティ（シェブロン）が表示されない                     |
| collapsible-defaultopen-effect-overrides-user | M      | bug      | `…/components/Collapsible/Collapsible.tsx:40` | Collapsible の defaultOpen が通常の React default プロパティと異なり、変化するたびにユーザー操作を上書きする |
| table-zebra-fidelity                          | M      | fidelity | `…/components/Table/Table.module.css:43`      | Table の striped（ゼブラ）表示が upstream vscode-table の zebra 仕様と乖離している                           |
| table-row-missing-aria-selected               | M      | a11y     | `…/components/Table/Table.tsx:270`            | TableRow が選択状態を aria-selected で公開しておらず、支援技術ユーザーが選択行を把握できない                 |
| collapsible-missing-arrow-key-toggle          | m      | fidelity | `…/components/Collapsible/Collapsible.tsx:65` | Collapsible のトリガーに ArrowLeft/ArrowRight による折りたたみ/展開が実装されていない                        |
| collapsible-title-not-heading                 | m      | a11y     | `…/components/Collapsible/Collapsible.tsx:78` | Collapsible のタイトルが <h3> ではなく <span> でマークアップされ、見出しナビゲーションの意味論が失われる     |

### プレビュー拡張(7 件)

| ID  | 重大度 | 分類      | 位置                            | 指摘                                                                             |
| --- | ------ | --------- | ------------------------------- | -------------------------------------------------------------------------------- |
| F1  | M      | packaging | `app/package.json:23`           | vscode:prepublish スクリプトが無く、VSIXパッケージング時にビルド漏れが起こり得る |
| F2  | M      | bug       | `app/src/extension.ts:72`       | webviewアセット欠落時にエラー検知・表示が一切なく無音で真っ白になる              |
| F3  | m      | bug       | `app/webview-ui/src/App.tsx:12` | ready/openハンドシェイクの結果がどこにも反映されないデッドコード                 |
| F4  | m      | design    | `app/src/extension.ts:34`       | webviewの状態永続化(setState/getState・WebviewPanelSerializer)が未実装           |
| F5  | m      | design    | `app/src/extension.ts:85`       | CSPのimg-srcが実際には使っていない任意httpsオリジンを許可している                |
| F6  | m      | bug       | `app/src/extension.ts:42`       | パネル再オープンのたびにcontext.subscriptionsへdisposableが際限なく蓄積する      |
| F7  | i      | packaging | `app/package.json:16`           | コマンドのtitleに拡張機能名を直接埋め込みcategoryフィールドを使っていない        |

### パッケージング(8 件)

| ID                                   | 重大度 | 分類      | 位置                                           | 指摘                                                                                              |
| ------------------------------------ | ------ | --------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| vscode-elements-not-externalized     | M      | packaging | `packages/vscode-components/vite.config.ts:88` | @vscode-elements/elementsがvite.config.tsのexternalから漏れておりdistへ丸ごとバンドルされる       |
| bare-react-namespace-dts             | m      | packaging | `…/components/Button/Button.tsx:6`             | 公開型定義(.d.ts)がグローバルReact名前空間に暗黙依存しており、環境によって型解決に失敗する        |
| esm-only-no-cjs                      | m      | packaging | `packages/vscode-components/package.json:21`   | CJS(require)読み込みに対応しておらずERR_PACKAGE_PATH_NOT_EXPORTEDで即座に失敗する                 |
| missing-sideeffects-field            | m      | packaging | `packages/vscode-components/package.json:`     | package.jsonにsideEffectsフィールドが無く、副作用インポートの安全性が暗黙の前提に依存している     |
| no-a11y-lint                         | m      | a11y      | `eslint.config.mjs:1`                          | ESLint設定にアクセシビリティ用ルール(jsx-a11y等)が含まれていない                                  |
| exports-missing-package-json-subpath | i      | packaging | `packages/vscode-components/package.json:21`   | exportsに./package.jsonサブパスが定義されておらずツールから参照できない                           |
| declarationmap-source-not-published  | i      | packaging | `packages/vscode-components/package.json:14`   | 宣言マップ(.d.ts.map)が公開されないsrc/を参照しておりGo to Definitionが機能しない                 |
| no-js-sourcemap                      | i      | packaging | `packages/vscode-components/vite.config.ts:80` | dist/index.jsにJavaScriptソースマップが生成されずランタイムエラーのスタックトレースが不透明になる |

### テーマ忠実度(8 件)

| ID                                    | 重大度 | 分類     | 位置                                                    | 指摘                                                                                                        |
| ------------------------------------- | ------ | -------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| tree-indent-guide-var-typo            | C      | bug      | `…/components/Tree/Tree.module.css:74`                  | Tree のインデントガイド変数名にハイフン抜けがあり実テーマ値を一切受け取れない                               |
| defaults-css-stale-dark-modern-values | M      | fidelity | `…/theme/defaults.css:29`                               | defaults.css の主要フォールバック値が現行既定テーマ Dark Modern ではなく旧 Dark+/ベースレジストリの値のまま |
| list-hover-background-rgba-overlay    | M      | fidelity | `…/theme/defaults.css:52`                               | list.hoverBackground が半透明白オーバーレイになっており実際の VS Code の単色値と乖離                        |
| button-font-size-hardcoded-12px       | M      | fidelity | `…/components/Button/Button.module.css:13`              | ボタン系コンポーネントの font-size が var(--vscode-font-size) を使わず 12px に固定されている                |
| corner-radius-medium-no-fallback      | M      | bug      | `…/components/ToolbarButton/ToolbarButton.module.css:5` | --vscode-cornerRadius-medium にフォールバックが無く、defaults.css にも未定義のため角丸が常に 0 になる       |
| border-radius-4px-vs-upstream-2px     | m      | fidelity | `…/components/Button/Button.module.css:9`               | ボタン・入力系の border-radius が 4px で、上流 (@vscode-elements) 実装の 2px より丸みが強い                 |
| invented-tree-background-var          | m      | fidelity | `…/components/Tree/Tree.module.css:9`                   | --vscode-tree-background は実在しない VS Code テーマカラー ID                                               |
| no-high-contrast-theme-support        | i      | a11y     | `…/theme/defaults.css:1`                                | defaults.css がハイコントラストテーマ (hc-dark/hc-light) を一切考慮していない                               |

### アクセシビリティ横断(8 件)

| ID                                                      | 重大度 | 分類 | 位置                                            | 指摘                                                                                                                                                       |
| ------------------------------------------------------- | ------ | ---- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| tree-inline-actions-invisible-focus                     | C      | a11y | `…/components/Tree/Tree.tsx:785`                | Tree の item.actions に置いたネイティブ button がタブ順序に紛れ込み、フォーカスが見えない状態でも操作可能になる                                            |
| listeditor-objecteditor-dnd-no-keyboard-alt             | C      | a11y | `…/hooks/useDragReorder.ts:19`                  | ListEditor/ObjectEditor の並べ替えが HTML5 drag-and-drop のみで、キーボード代替手段が存在しない                                                            |
| listeditor-objecteditor-no-focus-management-inline-edit | M      | a11y | `…/components/ListEditor/ListEditorRow.tsx:30`  | ListEditor/ObjectEditor のインライン編集開始・終了時にフォーカスが管理されず、キーボードユーザーがフォーカス位置を見失う                                   |
| formgroup-label-for-nonlabelable-group                  | M      | a11y | `…/components/FormGroup/FormGroup.tsx:58`       | FormGroup の htmlFor/id 連携が CheckboxGroup/RadioGroup のような role=group コンテナに対しては機能せず、アクセシブルネームが失われる                       |
| table-missing-aria-selected-color-only                  | M      | a11y | `…/components/Table/Table.tsx:264`              | Table の選択状態が aria-selected を持たず、背景色のみで示されている(色のみによる状態表現)                                                                  |
| table-role-table-but-interactive-grid-behavior          | M      | a11y | `…/components/Table/Table.tsx:116`              | Table が静的な role="table" でありながらフォーカス移動・選択が可能な対話的ウィジェットとして実装されており、スクリーンリーダーのブラウズモードと衝突しうる |
| listeditor-objecteditor-generic-aria-labels             | m      | a11y | `…/components/ListEditor/ListEditorRow.tsx:105` | ListEditor/ObjectEditor の行内アクションボタンが全行共通の非識別的な aria-label しか持たない                                                               |
| tree-missing-home-end-navigation                        | m      | a11y | `…/components/Tree/Tree.tsx:507`                | Tree が Home/End キーによる先頭・末尾ジャンプに対応していない                                                                                              |

---

## 5. 視覚レビューでのみ検出された問題(スクリーンショット比較)

上記コードレビューと重複しないもの:

| #                   | 対象          | 重大度 | 内容                                                                                                                              |
| ------------------- | ------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------- |
| V-COLLAPSE-OVERFLOW | Collapsible   | major  | 内部のテキスト入力がコンテナ右境界を約 20px はみ出す(2 班が独立に確認、両テーマで再現)                                            |
| V-LABEL-CONCAT      | Label         | major  | category と設定名が空白なしで直結表示(「Editor > FontEditor: Font Size」)。`.category` に margin/区切りがないことをコードでも確認 |
| V-MS-CLOSED         | MultiSelect   | major  | 閉状態がシェブロンなし・内容フィットの極小描画。invalid バリアントのみ全幅+シェブロン付きで不整合                                 |
| V-FG-VALIDATION     | FormGroup     | major  | エラーメッセージボックスが入力幅でなく全幅、入力自体に赤ボーダーが付かない(本家は同幅+赤枠)                                       |
| V-INVALID-FILL      | 共通          | minor  | invalid 時にフィールド本体まで `inputValidation-errorBackground` で塗り潰される(本家はフィールド背景維持+赤枠+下部メッセージ)     |
| V-ADD-PRIMARY       | エディタ類    | minor  | 「Add Item」がプライマリ(青)ボタン。本家設定エディタはセカンダリスタイル                                                          |
| V-CONTROL-WIDTH     | 設定行        | minor  | コントロール幅が 200px / 320px / 全幅と不統一(本家は約 320px 固定)                                                                |
| V-BOOL-LAYOUT       | 設定行        | minor  | ブール設定のチェックボックス配置が本家(説明文の左)と異なり、余分な「Enabled」ラベルが付く                                         |
| V-HELPER-SEV        | FormHelper    | minor  | warning / info バリアントが通常の説明文と視覚的に区別不能(警告色・アイコンなし)                                                   |
| V-RADIO-FILL        | Radio         | minor  | 未選択ラジオが塗り潰し円で描画され、選択状態・無効状態と紛らわしい(本家は輪郭のみ)                                                |
| V-TAB-TRUNC         | Tabs          | minor  | 狭幅でタブラベルが省略記号切り詰め+タブコンテンツ背景がペイン途中で途切れる                                                       |
| V-TREE-BADGE        | Tree          | minor  | インラインアクション用の空スロットによりバッジピルの右に不自然な空白                                                              |
| V-TABLE-ROWBG       | Table         | info   | 1 行だけ恒常的に背景色が付く(両テーマで再現。選択初期値の可能性)                                                                  |
| V-EMPTY-BOX         | CheckboxGroup | info   | 空状態がボーダー付きボックス(本家はプレーンテキスト)                                                                              |

---

## 6. 誤検知として除外した事項

- Storybook iframe 内の「Set string」ボタンや「Name / Description」テキスト: Storybook が常に DOM に持つ**非表示の docs 準備スケルトン**(`.sb-preparing-docs` / `.sb-argstableBlock`)であり、ライブラリの出力ではない。
- スモークテスト初回の 404 ×2: テスト用静的サーバーの favicon 欠落によるもの。
- 「全ストーリーでエラー表示」初期検出: 非表示の `.sb-errordisplay` テンプレートの誤検知(全ストーリーは正常描画)。

---

## 7. 推奨対応順

1. **(即時)** controlled 再アサート方式の統一(#1)/ `useWebComponentEvent` の早期 return 除去(#7)/ TextInput の onInput・onChange 二重登録解消(#8)— いずれも小さな修正で影響が大きい。
2. **(即時)** Tree・list 系 CSS 変数名の修正(#4)と `--vscode-cornerRadius-medium` へのフォールバック追加(#10)— webview 実環境での見た目が壊れている箇所。
3. **(高)** RadioGroup キーボードナビゲーションの再設計(#2)/ エディタ群の編集フロー修正(#3)。
4. **(高)** フォント一括適用(#6)と defaults.css の Dark Modern / Light Modern 準拠への更新、12px→変数化、4px→2px(#11)。
5. **(中)** a11y 対応: Tree アクションの tabindex 制御、DnD キーボード代替、編集フローのフォーカス管理、FormGroup→group の aria-labelledby 化、Table の aria-selected(#5)。
6. **(中)** Tree 既定値を本家準拠へ(`expandOnlyOnTwistieClick=false`、`renderIndentGuides='onHover'`)(#4)。
7. **(低)** パッケージング整備: vscode-elements の外部化方針決定、sideEffects 宣言、README 同梱、`vscode:prepublish` 追加(#12)。

---

## 8. 検証方法(付録)

- **静的レビュー**: ソースを 10 領域(ラッパー基盤 / フォームグループ / テキスト入力 / ボタン類 / エディタ / レイアウト / 拡張 / パッケージング / テーマ忠実度 / a11y)に分割し、各領域を独立レビュー後、**全 136 指摘を別の検証エージェントが対象コード・上流ソースに当たって裏取り**(結果: 136 件 confirmed、却下 0 件)。
- **上流比較の根拠**: `node_modules/@vscode-elements/elements` の実装・`custom-elements.json`・`vscode.css-custom-data.json`、および microsoft/vscode の `dark_modern.json` / `listColors.ts` 等(取得可能だったもの)。
- **動作確認**: Playwright + Chromium headless。Storybook 静的ビルドに対する全ストーリー描画チェック(コンソール・pageerror 監視、226 スクリーンショット取得)、および操作フロー・controlled 拒否シナリオの自動操作テスト。パッケージ消費テストは `npm pack` → 新規 Vite アプリで実施。
- **視覚比較**: 取得スクリーンショットを VS Code Dark/Light Modern の実 UI 仕様と突き合わせ(3 班・全 226 枚)。
- **制約**: VS Code 拡張の実機起動(Extension Host)は本環境では不可のため、拡張は静的レビューとビルド確認のみ。IME 実動作・スクリーンリーダー実機は未検証(コード上の分析のみ)。
