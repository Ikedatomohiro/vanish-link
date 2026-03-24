import { test, expect } from "@playwright/test";

test.describe("Vanish Link E2E", () => {
  test("一連のフロー: 作成 → 閲覧 → 消滅確認", async ({ page }) => {
    // ===== 1. トップページを開く =====
    await page.goto("/");
    await expect(page.getByText("パスワードを安全に送る。")).toBeVisible();

    // ===== 2. 機密テキストを入力 =====
    const secretText = "テスト用パスワード: S3cret!2026";
    await page.getByPlaceholder("パスワード、APIキー、機密メモなどを入力").fill(secretText);

    // 文字数カウンターが更新されること
    await expect(page.getByText(`${secretText.length.toLocaleString()} / 10,000`)).toBeVisible();

    // ===== 3. 消滅期限を「1時間」に変更 =====
    await page.getByRole("button", { name: "1時間" }).click();

    // ===== 4. リンクを生成 =====
    await page.getByRole("button", { name: "リンクを生成" }).click();

    // 生成完了を待つ
    const main = page.getByRole("main");
    await expect(main.getByText("リンクを生成しました")).toBeVisible({ timeout: 10000 });

    // バッジの確認（exact: trueで完全一致）
    await expect(main.getByText("1回限り", { exact: true })).toBeVisible();
    await expect(main.getByText("1時間で消滅", { exact: true })).toBeVisible();
    await expect(main.getByText("E2E暗号化", { exact: true })).toBeVisible();

    // ===== 5. 生成されたURLを取得 =====
    const urlInput = page.locator("input[readonly]");
    const generatedUrl = await urlInput.inputValue();
    expect(generatedUrl).toContain("/view/");
    expect(generatedUrl).toContain("#"); // URLフラグメントに復号鍵が含まれる

    // ===== 6. 閲覧画面にアクセス =====
    await page.goto(generatedUrl);

    // 閲覧確認画面が表示されること
    await expect(page.getByText("機密情報の閲覧確認")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("この内容は1回限り表示されます")).toBeVisible();

    // 警告メッセージの確認
    await expect(
      page.getByText("「表示する」をクリックすると、データはサーバーから即座に削除されます。")
    ).toBeVisible();

    // ===== 7. 「内容を表示する」をクリック =====
    await page.getByRole("button", { name: "内容を表示する" }).click();

    // 復号されたテキストが表示されること
    await expect(page.getByText(secretText)).toBeVisible({ timeout: 10000 });

    // 「閲覧済み・削除済み」バッジの確認
    await expect(page.getByText("閲覧済み・削除済み")).toBeVisible();

    // 注意メッセージの確認
    await expect(
      page.getByText("このデータはサーバーから完全に削除されました。")
    ).toBeVisible();

    // ===== 8. 同じURLに再アクセス → 消滅済み画面 =====
    // 新しいページで開くことでクライアント側のstateをリセット
    const newPage = await page.context().newPage();
    await newPage.goto(generatedUrl);

    await expect(newPage.getByText("このリンクはすでに消滅しました")).toBeVisible({
      timeout: 10000,
    });
    await expect(
      newPage.getByText("データはサーバーから完全に削除されています。")
    ).toBeVisible();

    // 「新しいリンクを作成」リンクが存在すること
    await expect(newPage.getByText("新しいリンクを作成")).toBeVisible();
    await newPage.close();
  });

  test("パスワード保護付きフロー", async ({ page }) => {
    const secretText = "極秘APIキー: ak_live_xxxx1234";
    const password = "MyP@ss!";

    // ===== 1. パスワード保護付きでリンク作成 =====
    await page.goto("/");
    await page.getByPlaceholder("パスワード、APIキー、機密メモなどを入力").fill(secretText);

    // パスワード保護をオンにする
    await page.getByRole("switch").click();
    await page.getByPlaceholder("閲覧時に必要なパスワード").fill(password);

    // リンク生成
    await page.getByRole("button", { name: "リンクを生成" }).click();
    const main = page.getByRole("main");
    await expect(main.getByText("リンクを生成しました")).toBeVisible({ timeout: 10000 });

    // パスワード保護バッジの確認
    await expect(main.getByText("パスワード保護", { exact: true })).toBeVisible();

    // URLを取得
    const urlInput = page.locator("input[readonly]");
    const generatedUrl = await urlInput.inputValue();

    // ===== 2. 閲覧画面 → パスワード入力 =====
    await page.goto(generatedUrl);

    // パスワード入力画面が表示されること
    await expect(page.getByText("パスワードが必要です")).toBeVisible({ timeout: 10000 });

    // パスワードを入力して表示
    await page.getByPlaceholder("パスワードを入力").fill(password);
    await page.getByRole("button", { name: "内容を表示" }).click();

    // 復号されたテキストが表示されること
    await expect(page.getByText(secretText)).toBeVisible({ timeout: 10000 });
  });

  test("存在しないリンクにアクセスすると消滅済み画面が表示される", async ({ page }) => {
    await page.goto("/view/non-existent-id#dummykey");
    await expect(page.getByText("このリンクはすでに消滅しました")).toBeVisible({
      timeout: 10000,
    });
  });

  test("空のテキストではリンクを生成できない", async ({ page }) => {
    await page.goto("/");

    // 送信ボタンがdisabledであること
    const submitButton = page.getByRole("button", { name: "リンクを生成" });
    await expect(submitButton).toBeDisabled();
  });
});
