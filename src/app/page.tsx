import { CreateSecretForm } from "@/components/create-secret-form";
import { Shield, Eye, Timer, Lock } from "lucide-react";

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

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      {/* ヒーローセクション */}
      <section className="text-center mb-12 md:mb-16">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
          消える。だから、
          <span className="text-primary">安心</span>。
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          パスワードやAPIキーを、Slackやメールに平文で送っていませんか？
          <br className="hidden sm:block" />
          Vanish Linkなら、1回限りの閲覧で自動消滅する安全なリンクを
          <br className="hidden sm:block" />
          ログイン不要・無料で今すぐ作成できます。
        </p>
      </section>

      {/* 入力フォーム */}
      <section className="mb-16 md:mb-24">
        <CreateSecretForm />
      </section>

      {/* 仕組み説明 */}
      <section className="max-w-4xl mx-auto">
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
    </div>
  );
}
