import type { ViewName } from "../lib/types";
import { guideSteps } from "../lib/practice-data";

type Props = {
  openView: (view: ViewName) => void;
};

export function GuideView({ openView }: Props) {
  return (
    <section className="app-view">
      <section className="guide-layout">
        <article className="guide-panel" aria-labelledby="about-title">
          <p className="eyebrow">About SignalDesk</p>
          <h2 id="about-title">Practice the path from incident to resolution.</h2>
          <p>
            SignalDesk contains authored incident scenarios with simulated owners,
            service health, logs, and metrics. Change statuses, check off runbook
            steps, and revisit your progress in this browser.
          </p>
          <div className="guide-note">
            <strong>Response owner</strong>
            <span>
              This is the team handling the selected issue. It is not a user
              account or login profile.
            </span>
          </div>
        </article>

        <article className="guide-panel" aria-labelledby="when-title">
          <p className="eyebrow">When to use it</p>
          <h2 id="when-title">Rehearse a response before you need one.</h2>
          <p>
            Choose a checkout, inventory, login, or notification scenario. Public
            status checks use real GitHub, Vercel, and Cloudflare APIs, separately
            from those scenarios. Reviews follow fixed rules; they do not diagnose
            real systems or use an AI model.
          </p>
          <div className="guide-note soft">
            <strong>Main idea</strong>
            <span>
              Refresh to keep your saved statuses, checklist, and activity. Reset practice
              restores the starting scenarios. Clearing browser data also removes progress;
              there are no accounts, cross-device sync, or alerts from your infrastructure.
            </span>
          </div>
        </article>
      </section>

      <section className="guide-steps" aria-label="How to use SignalDesk">
        {guideSteps.map((step) => (
          <button
            className="guide-step"
            key={step.label}
            onClick={() => openView(step.view)}
            type="button"
          >
            <span>{step.label}</span>
            <strong>{step.title}</strong>
            <p>{step.detail}</p>
          </button>
        ))}
      </section>
    </section>
  );
}
