import { CreateSecretForm } from "@/components/create-secret-form";
import { Shield, Eye, Timer, Lock, Users, Zap, HelpCircle } from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "エンドツーエンド暗号化",
    description: "AES-256-GCMで暗号化。復号鍵はURLに埋め込まれ、サーバーには送信されません。",
  },
  {
    icon: Eye,
    title: "1回限りの閲覧",
    description: "リンクを開いた瞬間にサーバーからデータを即座に物理削除します。",
  },
  {
    icon: Timer,
    title: "自動消滅",
    description: "設定した期限を過ぎると、閲覧されなくても自動的にデータが消滅します。",
  },
  {
    icon: Shield,
    title: "ゼロ知識設計",
    description: "サーバー管理者すら内容を閲覧できない設計。信頼ではなく、仕組みで安全を担保します。",
  },
];

const useCases = [
  {
    icon: Users,
    title: "チームでのパスワード共有",
    description:
      "Slackやメールにパスワードを平文で貼り付ける代わりに、Vanish Linkで安全に送信。閲覧後に自動消滅するので、チャット履歴にパスワードが残りません。",
  },
  {
    icon: Zap,
    title: "APIキー・シークレットの受け渡し",
    description:
      "開発チーム間でのAPIキーやデータベース接続情報の受け渡しに最適。ログイン不要で誰でもすぐ使え、情報漏洩のリスクを最小化します。",
  },
  {
    icon: Shield,
    title: "法務・人事の機密文書",
    description:
      "契約書のパスワードや個人情報など、社外に送る必要がある機密情報を安全に共有。送信履歴が残らないため、情報管理の負担を軽減します。",
  },
];

const faqs = [
  {
    question: "パスワードをSlackやメールで送るのは危険ですか？",
    answer:
      "はい。Slackやメールで送ったパスワードはサーバーに永続的に保存され、検索やバックアップで第三者に閲覧されるリスクがあります。Vanish Linkなら1回閲覧後にデータが消滅するため、履歴に残りません。",
  },
  {
    question: "本当にサーバーにデータは残りませんか？",
    answer:
      "はい。暗号化はお使いのブラウザ上（クライアントサイド）で行われ、サーバーには暗号化済みデータのみが保存されます。復号鍵はURLの#以降（フラグメント）に含まれ、サーバーには送信されません。さらに、閲覧時にデータは即座に物理削除されます。",
  },
  {
    question: "無料で使えますか？ログインは必要ですか？",
    answer:
      "完全無料、ログイン不要でお使いいただけます。会員登録も不要で、今すぐパスワードの安全な共有を始められます。",
  },
  {
    question: "どのような暗号化方式を使っていますか？",
    answer:
      "Web Crypto APIによるAES-256-GCM暗号化を使用しています。これは銀行やVPNでも採用されている業界標準の暗号化方式です。",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Vanish Link",
  description:
    "パスワードやAPIキーを安全に共有できる無料ツール。1回閲覧で自動消滅するワンタイムリンクを生成。",
  url: "https://vanish-link.vercel.app",
  applicationCategory: "SecurityApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "JPY",
  },
  featureList: [
    "エンドツーエンド暗号化",
    "ワンタイムリンク生成",
    "自動データ消滅",
    "パスワード保護",
    "ログイン不要",
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* ヒーローセクション */}
        <section className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            パスワードを安全に送る。
            <br className="hidden sm:block" />
            <span className="text-primary">1回見たら、消える。</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            パスワードやAPIキーを、Slackやメールに平文で送っていませんか？
            <br className="hidden sm:block" />
            Vanish Linkなら、1回限りの閲覧で自動消滅する安全なリンクを
            <br className="hidden sm:block" />
            <strong>ログイン不要・無料</strong>で今すぐ作成できます。
          </p>
        </section>

        {/* 入力フォーム */}
        <section className="mb-16 md:mb-24">
          <CreateSecretForm />
        </section>

        {/* 仕組み説明 */}
        <section className="max-w-4xl mx-auto mb-16 md:mb-24">
          <h2 className="text-xl md:text-2xl font-semibold text-center mb-8">
            なぜ安全なのか
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex gap-4 p-4 rounded-lg border border-border/50 bg-card/50"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                    <feature.icon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 利用シーン */}
        <section className="max-w-4xl mx-auto mb-16 md:mb-24">
          <h2 className="text-xl md:text-2xl font-semibold text-center mb-3">
            こんな場面で使われています
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-8">
            エンジニア・法務・人事など、機密情報を扱うすべての方へ
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {useCases.map((useCase) => (
              <div
                key={useCase.title}
                className="p-5 rounded-lg border border-border/50 bg-card/50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 mb-3">
                  <useCase.icon className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-medium mb-2">{useCase.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto mb-16 md:mb-24">
          <h2 className="text-xl md:text-2xl font-semibold text-center mb-8">
            よくある質問
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-lg border border-border/50 bg-card/50"
              >
                <summary className="flex cursor-pointer items-center gap-3 p-4 font-medium">
                  <HelpCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{faq.question}</span>
                </summary>
                <p className="px-4 pb-4 pl-11 text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* CTAセクション */}
        <section className="text-center mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-2">
            今すぐパスワードを安全に共有しましょう
          </h2>
          <p className="text-sm text-muted-foreground">
            ログイン不要・無料・暗号化済み。上のフォームからすぐに始められます。
          </p>
        </section>
      </div>
    </>
  );
}
