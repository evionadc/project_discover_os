import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "../../discovery/components/PageHeader";
import { EmptyState } from "../../discovery/components/EmptyState";
import { listInceptions, createInception, listInceptionSteps, upsertInceptionStep } from "../services/inceptionApi";
import type { Inception, InceptionStep } from "../types";
import { useWorkspace } from "../../shared/hooks/useWorkspace";
import { createPersona, getPersonas, getProblems } from "../../discovery/services/discoveryApi";
import type { Persona, Problem } from "../../discovery/types";
import ProductVisionSection from "../components/ProductVisionSection";
import BoundariesSection from "../components/BoundariesSection";
import JourneySection from "../components/JourneySection";
import FeatureReviewSection from "../components/FeatureReviewSection";

type StepKey =
  | "product_vision"
  | "boundaries"
  | "personas"
  | "journey_map"
  | "feature_review"
  | "mvp_canvas";

const steps: { key: StepKey; title: string; description: string }[] = [
  { key: "product_vision", title: "Visão do Produto", description: "Defina o propósito e o valor central." },
  { key: "boundaries", title: "É / Não é / Faz / Não faz", description: "Explore o escopo do produto." },
  { key: "personas", title: "Personas", description: "Selecione as personas-alvo." },
  { key: "journey_map", title: "Jornada do Usuário", description: "Mapeie etapas, dores e expectativas." },
  { key: "feature_review", title: "Brainstorming & Review de Features", description: "Brainstorm e revisão Tech/UX/Business." },
  { key: "mvp_canvas", title: "Canvas do MVP", description: "Defina escopo, métricas e cronograma do MVP." },
];

const splitLines = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const joinLines = (items?: string[]) => (items && items.length > 0 ? items.join("\n") : "");

export default function InceptionWizardPage() {
  const workspace = useWorkspace();
  const [inceptions, setInceptions] = useState<Inception[]>([]);
  const [selectedInceptionId, setSelectedInceptionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<StepKey>("product_vision");

  const [newTitle, setNewTitle] = useState("Lean Inception");

  const [personas, setPersonas] = useState<Persona[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);

  const [targetAudience, setTargetAudience] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [keyBenefit, setKeyBenefit] = useState("");
  const [alternatives, setAlternatives] = useState("");
  const [differential, setDifferential] = useState("");
  const [isText, setIsText] = useState("");
  const [isNotText, setIsNotText] = useState("");
  const [doesText, setDoesText] = useState("");
  const [doesNotText, setDoesNotText] = useState("");
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<string[]>([]);
  const [journeyText, setJourneyText] = useState("");
  const [journeyCards, setJourneyCards] = useState<{ id: string; text: string }[]>([]);
  const [newJourneyText, setNewJourneyText] = useState("");
  const [rawFeaturesText, setRawFeaturesText] = useState("");
  const [featureCards, setFeatureCards] = useState<{ id: string; text: string }[]>([]);
  const [newFeatureText, setNewFeatureText] = useState("");
  const [reviewCards, setReviewCards] = useState<{
    id: string;
    text: string;
    what: "low" | "medium" | "high";
    how: "low" | "medium" | "high";
    effort?: 1 | 2 | 3;
    business?: 1 | 2 | 3;
    ux?: 1 | 2 | 3;
  }[]>([]);
  const [sequencingWaves, setSequencingWaves] = useState<{ id: string; cards: string[] }[]>([]);
  const [sequencingDeps, setSequencingDeps] = useState<Record<string, string | "">>({});
  const [essentialScope, setEssentialScope] = useState("");
  const [successMetrics, setSuccessMetrics] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
  const [costSchedule, setCostSchedule] = useState("");
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([]);
  const [newPersonaProblemId, setNewPersonaProblemId] = useState("");
  const [newPersonaName, setNewPersonaName] = useState("");
  const [newPersonaContext, setNewPersonaContext] = useState("");
  const [newPersonaGoal, setNewPersonaGoal] = useState("");
  const [newPersonaPain, setNewPersonaPain] = useState("");

  const hydrateSteps = useCallback(
    (stepsData: InceptionStep[]) => {
      const map = new Map(stepsData.map((step) => [step.step_key, step.payload]));
      const vision = map.get("product_vision") as
        | {
            target_audience?: string;
            problem_statement?: string;
            product_name?: string;
            product_category?: string;
            key_benefit?: string;
            alternatives?: string;
            differential?: string;
          }
        | undefined;
      setTargetAudience(vision?.target_audience ?? "");
      setProblemStatement(vision?.problem_statement ?? "");
      setProductName(vision?.product_name ?? "");
      setProductCategory(vision?.product_category ?? "");
      setKeyBenefit(vision?.key_benefit ?? "");
      setAlternatives(vision?.alternatives ?? "");
      setDifferential(vision?.differential ?? "");

      const boundaries = map.get("boundaries") as
        | { is?: string[]; is_not?: string[]; does?: string[]; does_not?: string[] }
        | undefined;
      setIsText(joinLines(boundaries?.is));
      setIsNotText(joinLines(boundaries?.is_not));
      setDoesText(joinLines(boundaries?.does));
      setDoesNotText(joinLines(boundaries?.does_not));

      const personaPayload = map.get("personas") as { persona_ids?: string[] } | undefined;
      setSelectedPersonaIds(personaPayload?.persona_ids ?? []);

      const journeyPayload = map.get("journey_map") as {
        stages?: { stage: string; emotion?: string; pain?: string }[];
      } | undefined;
      setJourneyText(
        journeyPayload?.stages?.map((stage) => `${stage.stage} | ${stage.emotion ?? ""} | ${stage.pain ?? ""}`).join("\n") ??
          ""
      );
      if (journeyPayload?.stages?.length) {
        setJourneyCards(
          journeyPayload.stages.map((stage, index) => ({
            id: `stage-${index}-${stage.stage}`,
            text: stage.stage,
          }))
        );
      } else {
        setJourneyCards([]);
      }

      const featureReviewPayload = map.get("feature_review") as
        | { features?: { text: string; what?: string; how?: string; effort?: number; business?: number; ux?: number }[] }
        | undefined;

      if (featureReviewPayload?.features?.length) {
        setFeatureCards(
          featureReviewPayload.features.map((feature, index) => ({
            id: `feature-${index}-${feature.text}`,
            text: feature.text,
          }))
        );
        setReviewCards(
          featureReviewPayload.features.map((feature, index) => ({
            id: `review-${index}-${feature.text}`,
            text: feature.text,
            what: (feature.what as "low" | "medium" | "high") ?? "medium",
            how: (feature.how as "low" | "medium" | "high") ?? "medium",
            effort: feature.effort as 1 | 2 | 3 | undefined,
            business: feature.business as 1 | 2 | 3 | undefined,
            ux: feature.ux as 1 | 2 | 3 | undefined,
          }))
        );
      } else {
        const rawFeaturesPayload = map.get("raw_features") as { features?: string[] } | undefined;
        setRawFeaturesText(joinLines(rawFeaturesPayload?.features));
        if (rawFeaturesPayload?.features?.length) {
          setFeatureCards(
            rawFeaturesPayload.features.map((feature, index) => ({
              id: `feature-${index}-${feature}`,
              text: feature,
            }))
          );
        } else {
          setFeatureCards([]);
        }

        const reviewPayload = map.get("review_matrix") as { items?: string[] } | undefined;
        if (reviewPayload?.items?.length) {
          const parsed = reviewPayload.items.map((item, index) => {
            const [text, ...meta] = item.split("|");
            const metaMap = new Map(meta.map((entry) => entry.split(":") as [string, string]));
            return {
              id: `review-${index}-${text}`,
              text: text.trim(),
              what: (metaMap.get("what") as "low" | "medium" | "high") ?? "medium",
              how: (metaMap.get("how") as "low" | "medium" | "high") ?? "medium",
              effort: (metaMap.get("effort") ? Number(metaMap.get("effort")) : undefined) as 1 | 2 | 3 | undefined,
              business: (metaMap.get("business") ? Number(metaMap.get("business")) : undefined) as 1 | 2 | 3 | undefined,
              ux: (metaMap.get("ux") ? Number(metaMap.get("ux")) : undefined) as 1 | 2 | 3 | undefined,
            };
          });
          setReviewCards(parsed);
          if (featureCards.length === 0) {
            setFeatureCards(parsed.map((card, index) => ({ id: `feature-${index}-${card.text}`, text: card.text })));
          }
        } else {
          setReviewCards([]);
        }
      }

      const sequencingPayload = map.get("sequencing") as
        | { waves?: { id: string; cards: string[] }[]; deps?: Record<string, string> }
        | undefined;
      if (sequencingPayload?.waves) {
        setSequencingWaves(sequencingPayload.waves);
        setSequencingDeps(sequencingPayload.deps ?? {});
      }

      const mvpPayload = map.get("mvp_canvas") as {
        essential_scope?: string;
        success_metrics?: string;
        acceptance_criteria?: string;
        cost_schedule?: string;
        feature_ids?: string[];
      } | undefined;
      setEssentialScope(mvpPayload?.essential_scope ?? "");
      setSuccessMetrics(mvpPayload?.success_metrics ?? "");
      setAcceptanceCriteria(mvpPayload?.acceptance_criteria ?? "");
      setCostSchedule(mvpPayload?.cost_schedule ?? "");
      setSelectedFeatureIds(mvpPayload?.feature_ids ?? []);
    },
    [featureCards.length]
  );

  const formFieldStyle: React.CSSProperties = {
    display: "block",
    marginBottom: 8,
    width: 520,
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#111827",
    fontSize: 14,
  };

  const primaryButton: React.CSSProperties = {
    background: "#2563eb",
    border: "1px solid #1d4ed8",
    color: "#ffffff",
    padding: "8px 14px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  };

  const secondaryButton: React.CSSProperties = {
    background: "transparent",
    border: "1px solid #d1d5db",
    color: "#111827",
    padding: "8px 14px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([listInceptions("lean_inception"), getPersonas(), getProblems()])
      .then(([inceptionData, personaData, problemData]) => {
        if (!isMounted) return;
        setInceptions(inceptionData);
        setPersonas(personaData);
        setProblems(problemData);
        if (inceptionData.length > 0) {
          setSelectedInceptionId(inceptionData[0].id);
        }
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message ?? "Failed to load inception data");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedInceptionId) return;
    let isMounted = true;
    listInceptionSteps(selectedInceptionId)
      .then((stepsData: InceptionStep[]) => {
        if (!isMounted) return;
        hydrateSteps(stepsData);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message ?? "Failed to load steps");
      });

    return () => {
      isMounted = false;
    };
  }, [selectedInceptionId, hydrateSteps]);

  const handleCreateInception = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      const created = await createInception({
        workspace_id: workspace.id,
        type: "lean_inception",
        title: newTitle.trim(),
      });
      setInceptions((prev) => [created, ...prev]);
      setSelectedInceptionId(created.id);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveStep = async () => {
    if (!selectedInceptionId) return;
    setSaving(true);
    try {
      let payload: Record<string, unknown> = {};
      if (activeStep === "product_vision") {
        payload = {
          target_audience: targetAudience,
          problem_statement: problemStatement,
          product_name: productName,
          product_category: productCategory,
          key_benefit: keyBenefit,
          alternatives,
          differential,
        };
      } else if (activeStep === "boundaries") {
        payload = {
          is: splitLines(isText),
          is_not: splitLines(isNotText),
          does: splitLines(doesText),
          does_not: splitLines(doesNotText),
        };
      } else if (activeStep === "personas") {
        payload = { persona_ids: selectedPersonaIds };
      } else if (activeStep === "journey_map") {
        const stages = journeyCards.length
          ? journeyCards.map((card) => ({ stage: card.text }))
          : splitLines(journeyText).map((line) => {
          const [stage, emotion, pain] = line.split("|").map((item) => item.trim());
          return { stage, emotion, pain };
        });
        payload = { stages };
      } else if (activeStep === "feature_review") {
        const cards = featureCards.length
          ? featureCards
          : splitLines(rawFeaturesText).map((text, index) => ({
              id: `feature-${index}-${text}`,
              text,
            }));
        const reviewMap = new Map(reviewCards.map((card) => [card.text, card]));
        payload = {
          features: cards.map((card) => {
            const review = reviewMap.get(card.text);
            return {
              text: card.text,
              what: review?.what ?? "medium",
              how: review?.how ?? "medium",
              effort: review?.effort,
              business: review?.business,
              ux: review?.ux,
            };
          }),
        };
      } else if (activeStep === "mvp_canvas") {
          payload = {
            essential_scope: essentialScope,
            success_metrics: successMetrics,
            acceptance_criteria: acceptanceCriteria,
            cost_schedule: costSchedule,
            feature_ids: selectedFeatureIds,
          };
      }
      await upsertInceptionStep(selectedInceptionId, activeStep, payload);
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePersona = async () => {
    if (!newPersonaProblemId || !newPersonaName.trim()) return;
    setSaving(true);
    try {
      const created = await createPersona({
        problem_id: newPersonaProblemId,
        name: newPersonaName.trim(),
        context: newPersonaContext.trim().length > 0 ? newPersonaContext : undefined,
        goal: newPersonaGoal.trim().length > 0 ? newPersonaGoal : undefined,
        main_pain: newPersonaPain.trim().length > 0 ? newPersonaPain : undefined,
      });
      setPersonas((prev) => [...prev, created]);
      setSelectedPersonaIds((prev) => [...prev, created.id]);
      setNewPersonaName("");
      setNewPersonaContext("");
      setNewPersonaGoal("");
      setNewPersonaPain("");
    } finally {
      setSaving(false);
    }
  };

  const activeStepConfig = useMemo(
    () => steps.find((step) => step.key === activeStep),
    [activeStep]
  );

  const productVisionSummary = useMemo(() => {
    const parts: string[] = [];
    if (targetAudience) parts.push(`Para ${targetAudience}`);
    if (productName) parts.push(`o ${productName}`);
    if (problemStatement) parts.push(`resolve ${problemStatement}`);
    if (productCategory) parts.push(`como ${productCategory}`);
    if (keyBenefit) parts.push(`trazendo ${keyBenefit}`);
    if (differential) parts.push(`diferente por ${differential}`);
    return parts.join(", ");
  }, [targetAudience, productName, problemStatement, productCategory, keyBenefit, differential]);

useEffect(() => {
    if (activeStep !== "feature_review") return;
    if (sequencingWaves.length > 0) return;
    setSequencingWaves(
      Array.from({ length: 8 }).map((_, idx) => ({
        id: `wave-${idx + 1}`,
        cards: [],
      }))
    );
  }, [activeStep, sequencingWaves.length]);

  useEffect(() => {
    if (activeStep !== "feature_review") return;
    if (reviewCards.length > 0) return;
    if (featureCards.length === 0) return;
    setReviewCards(
      featureCards.map((card, index) => ({
        id: `review-from-feature-${index}-${card.text}`,
        text: card.text,
        what: "medium",
        how: "medium",
        effort: undefined,
        business: undefined,
        ux: undefined,
      }))
    );
  }, [activeStep, featureCards, reviewCards.length]);
  useEffect(() => {
    if (activeStep !== "mvp_canvas") return;
    if (essentialScope.trim().length > 0) return;
    if (!productVisionSummary) return;
    setEssentialScope(productVisionSummary);
  }, [activeStep, essentialScope, productVisionSummary]);


  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <PageHeader title="Lean Inception" subtitle="Discovery → Visão do produto" />

      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

      <section style={{ marginBottom: 16 }}>
        {inceptions.length === 0 ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              placeholder="Nome da inception"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={formFieldStyle}
            />
            <button onClick={handleCreateInception} style={primaryButton} disabled={saving}>
              {saving ? "Creating..." : "Create"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={selectedInceptionId}
              onChange={(e) => setSelectedInceptionId(e.target.value)}
              style={{ ...formFieldStyle, width: 360, marginBottom: 0 }}
            >
              {inceptions.map((inception) => (
                <option key={inception.id} value={inception.id}>
                  {inception.title}
                </option>
              ))}
            </select>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                placeholder="Nova inception"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{ ...formFieldStyle, width: 240, marginBottom: 0 }}
              />
              <button onClick={handleCreateInception} style={secondaryButton} disabled={saving}>
                + Nova
              </button>
            </div>
          </div>
        )}
      </section>

      {selectedInceptionId ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 240px) minmax(0, 1fr)",
            gap: 24,
          }}
        >
          <aside>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {steps.map((step) => (
                <li
                  key={step.key}
                  onClick={() => setActiveStep(step.key)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 6,
                    cursor: "pointer",
                    background: activeStep === step.key ? "#e5e7eb" : "transparent",
                    fontWeight: activeStep === step.key ? 600 : 500,
                    color: "#111827",
                    marginBottom: 6,
                  }}
                >
                  {step.title}
                </li>
              ))}
            </ul>
          </aside>

          <section style={{ minWidth: 0 }}>
            <h2 style={{ marginTop: 0 }}>{activeStepConfig?.title}</h2>
            <p style={{ color: "#6b7280", marginTop: 0 }}>{activeStepConfig?.description}</p>
            <div style={{ margin: "12px 0 20px" }}>
              <button onClick={handleSaveStep} style={primaryButton} disabled={saving}>
              {saving ? "Salvando..." : "Salvar etapa"}
              </button>
            </div>

                        {activeStep === "product_vision" && (
              <ProductVisionSection
                formFieldStyle={formFieldStyle}
                targetAudience={targetAudience}
                setTargetAudience={setTargetAudience}
                problemStatement={problemStatement}
                setProblemStatement={setProblemStatement}
                productName={productName}
                setProductName={setProductName}
                productCategory={productCategory}
                setProductCategory={setProductCategory}
                keyBenefit={keyBenefit}
                setKeyBenefit={setKeyBenefit}
                alternatives={alternatives}
                setAlternatives={setAlternatives}
                differential={differential}
                setDifferential={setDifferential}
              />
            )}


                        {activeStep === "boundaries" && (
              <BoundariesSection
                formFieldStyle={formFieldStyle}
                isText={isText}
                setIsText={setIsText}
                isNotText={isNotText}
                setIsNotText={setIsNotText}
                doesText={doesText}
                setDoesText={setDoesText}
                doesNotText={doesNotText}
                setDoesNotText={setDoesNotText}
              />
            )}


            {activeStep === "personas" && (
              <>
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: 16,
                    marginBottom: 16,
                  }}
                >
                  <h4 style={{ marginTop: 0 }}>Nova persona</h4>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                    <div>
                      <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#6b7280" }}>
                        Problema associado
                      </label>
                      <select
                        value={newPersonaProblemId}
                        onChange={(e) => setNewPersonaProblemId(e.target.value)}
                        style={{ ...formFieldStyle, width: 260, marginBottom: 0 }}
                      >
                        <option value="">Selecione...</option>
                        {problems.map((problem) => (
                          <option key={problem.id} value={problem.id}>
                            {problem.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#ffffff",
                      border: "2px solid #111827",
                      borderRadius: 12,
                      padding: 12,
                      position: "relative",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 12,
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: "50%",
                          top: 0,
                          bottom: 0,
                          width: 2,
                          background: "#111827",
                          opacity: 0.85,
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: 0,
                          right: 0,
                          height: 2,
                          background: "#111827",
                          opacity: 0.85,
                        }}
                      />

                      <div style={{ padding: 10 }}>
                        <input
                          placeholder="Nome da persona"
                          value={newPersonaName}
                          onChange={(e) => setNewPersonaName(e.target.value)}
                          style={{ ...formFieldStyle, width: 220, marginBottom: 12 }}
                        />
                        <div
                          style={{
                            width: 84,
                            height: 84,
                            borderRadius: "50%",
                            border: "2px solid #111827",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 28,
                          }}
                        >
                          ðŸ™‚
                        </div>
                      </div>

                      <div style={{ padding: 10 }}>
                        <strong>Perfil</strong>
                        <textarea
                          placeholder="Idade, contexto, profissão"
                          value={newPersonaContext}
                          onChange={(e) => setNewPersonaContext(e.target.value)}
                          style={{ ...formFieldStyle, width: "100%", minHeight: 90 }}
                        />
                      </div>

                      <div style={{ padding: 10 }}>
                        <strong>Comportamento</strong>
                        <textarea
                          placeholder="Hábitos e comportamentos"
                          value={newPersonaPain}
                          onChange={(e) => setNewPersonaPain(e.target.value)}
                          style={{ ...formFieldStyle, width: "100%", minHeight: 90 }}
                        />
                      </div>

                      <div style={{ padding: 10 }}>
                        <strong>Necessidades</strong>
                        <textarea
                          placeholder="Objetivos e necessidades"
                          value={newPersonaGoal}
                          onChange={(e) => setNewPersonaGoal(e.target.value)}
                          style={{ ...formFieldStyle, width: "100%", minHeight: 90 }}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleCreatePersona}
                    style={{ ...primaryButton, marginTop: 12 }}
                    disabled={saving || !newPersonaProblemId || !newPersonaName.trim()}
                  >
                    {saving ? "Saving..." : "Add persona"}
                  </button>
                </div>

                {personas.length === 0 ? (
                  <EmptyState title="Sem personas" description="Crie personas no módulo de Discovery." />
                ) : (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {personas.map((persona) => (
                        <label key={persona.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <input
                            type="checkbox"
                            checked={selectedPersonaIds.includes(persona.id)}
                            onChange={(e) => {
                              setSelectedPersonaIds((prev) =>
                                e.target.checked ? [...prev, persona.id] : prev.filter((id) => id !== persona.id)
                              );
                            }}
                          />
                          {persona.name}
                        </label>
                      ))}
                    </div>

                    <div
                      style={{
                        marginTop: 20,
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                        gap: 16,
                      }}
                    >
                      {personas
                        .filter((persona) => selectedPersonaIds.includes(persona.id))
                        .map((persona) => (
                          <div
                            key={persona.id}
                            style={{
                              background: "#ffffff",
                              border: "2px solid #111827",
                              borderRadius: 12,
                              padding: 16,
                              position: "relative",
                            }}
                          >
                            <div style={{ fontWeight: 700, marginBottom: 6 }}>{persona.name}</div>
                            <div
                              style={{
                                position: "absolute",
                                top: 52,
                                left: 16,
                                right: 16,
                                height: 1,
                                background: "#111827",
                                opacity: 0.8,
                              }}
                            />
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 12,
                                marginTop: 12,
                              }}
                            >
                              <div style={{ borderRight: "1px solid #111827", paddingRight: 12 }}>
                                <strong>Perfil</strong>
                                <p style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>
                                  {persona.context || "Descreva o perfil da persona."}
                                </p>
                              </div>
                              <div>
                                <strong>Necessidades</strong>
                                <p style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>
                                  {persona.goal || "Liste necessidades e objetivos."}
                                </p>
                              </div>
                              <div style={{ borderRight: "1px solid #111827", paddingRight: 12 }}>
                                <strong>Comportamento</strong>
                                <p style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>
                                  {persona.main_pain || "Liste dores e comportamentos."}
                                </p>
                              </div>
                              <div>
                                <strong>Notas</strong>
                                <p style={{ marginTop: 6, whiteSpace: "pre-wrap", color: "#6b7280" }}>
                                  Opcional: idade, contexto social, ferramentas usadas.
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </>
            )}

                        
            {activeStep === "journey_map" && (
              <JourneySection
                formFieldStyle={formFieldStyle}
                secondaryButton={secondaryButton}
                journeyCards={journeyCards}
                setJourneyCards={setJourneyCards}
                newJourneyText={newJourneyText}
                setNewJourneyText={setNewJourneyText}
                journeyText={journeyText}
                setJourneyText={setJourneyText}
              />
            )}

            {activeStep === "feature_review" && (
              <FeatureReviewSection
                formFieldStyle={formFieldStyle}
                secondaryButton={secondaryButton}
                newFeatureText={newFeatureText}
                setNewFeatureText={setNewFeatureText}
                featureCards={featureCards}
                setFeatureCards={setFeatureCards}
                reviewCards={reviewCards}
                setReviewCards={setReviewCards}
                rawFeaturesText={rawFeaturesText}
                setRawFeaturesText={setRawFeaturesText}
                waves={sequencingWaves}
                setWaves={setSequencingWaves}
                deps={sequencingDeps}
                setDeps={setSequencingDeps}
              />
            )}

            {activeStep === "mvp_canvas" && (
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 16,
                  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, 1fr)",
                    gridTemplateRows: "minmax(140px, auto) minmax(180px, auto) minmax(140px, auto)",
                    gap: 0,
                    border: "2px solid #111827",
                    borderRadius: 10,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      borderRight: "2px solid #111827",
                      borderBottom: "2px solid #111827",
                      padding: 12,
                    }}
                  >
                    <strong>Personas segmentadas</strong>
                    <textarea
                      readOnly
                      value={personas
                        .filter((persona) => selectedPersonaIds.includes(persona.id))
                        .map((persona) => persona.name)
                        .join("\n")}
                      style={{ ...formFieldStyle, width: "100%", minHeight: 120, marginTop: 8, background: "#f9fafb" }}
                    />
                  </div>
                  <div
                    style={{
                      borderRight: "2px solid #111827",
                      borderBottom: "2px solid #111827",
                      padding: 12,
                    }}
                  >
                    <strong>Proposta do MVP</strong>
                    <textarea
                      value={essentialScope}
                      onChange={(e) => setEssentialScope(e.target.value)}
                      placeholder="Resuma a proposta de valor do MVP"
                      style={{ ...formFieldStyle, width: "100%", minHeight: 120, marginTop: 8 }}
                    />
                    {productVisionSummary && essentialScope.trim() !== productVisionSummary.trim() && (
                      <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
                        Sugestao: {productVisionSummary}
                      </div>
                    )}
                  </div>
                  <div style={{ borderBottom: "2px solid #111827", padding: 12 }}>
                    <strong>Resultado esperado</strong>
                    <textarea
                      value={acceptanceCriteria}
                      onChange={(e) => setAcceptanceCriteria(e.target.value)}
                      placeholder="Descreva o resultado esperado"
                      style={{ ...formFieldStyle, width: "100%", minHeight: 120, marginTop: 8 }}
                    />
                  </div>

                  <div
                    style={{
                      borderRight: "2px solid #111827",
                      borderBottom: "2px solid #111827",
                      padding: 12,
                      gridRow: "2 / span 2",
                    }}
                  >
                    <strong>Jornadas</strong>
                    <textarea
                      readOnly
                      value={journeyCards.length ? journeyCards.map((card) => `- ${card.text}`).join("\n") : journeyText}
                      style={{ ...formFieldStyle, width: "100%", minHeight: 220, marginTop: 8, background: "#f9fafb" }}
                    />
                  </div>
                  <div
                    style={{
                      borderRight: "2px solid #111827",
                      borderBottom: "2px solid #111827",
                      padding: 12,
                    }}
                  >
                    <strong>Funcionalidades (ondas 1-4)</strong>
                    <textarea
                      readOnly
                      value={(() => {
                        const featureById = new Map(featureCards.map((card) => [card.id, card.text]));
                        const names: string[] = [];
                        sequencingWaves.slice(0, 4).forEach((wave) => {
                          wave.cards.forEach((cardId) => {
                            const name = featureById.get(cardId);
                            if (name && !names.includes(name)) names.push(name);
                          });
                        });
                        return names.join("\n");
                      })()}
                      style={{ ...formFieldStyle, width: "100%", minHeight: 160, marginTop: 8, background: "#f9fafb" }}
                    />
                  </div>
                  <div
                    style={{
                      borderBottom: "2px solid #111827",
                      padding: 12,
                      gridRow: "2 / span 2",
                    }}
                  >
                    <strong>Metricas para validar as hipoteses</strong>
                    <textarea
                      value={successMetrics}
                      onChange={(e) => setSuccessMetrics(e.target.value)}
                      placeholder="Defina as metricas principais"
                      style={{ ...formFieldStyle, width: "100%", minHeight: 220, marginTop: 8 }}
                    />
                  </div>

                  <div style={{ borderRight: "2px solid #111827", padding: 12 }}>
                    <strong>Custo & Cronograma</strong>
                    <textarea
                      value={costSchedule}
                      onChange={(e) => setCostSchedule(e.target.value)}
                      placeholder="Estimativas de custo e prazo"
                      style={{ ...formFieldStyle, width: "100%", minHeight: 120, marginTop: 8 }}
                    />
                  </div>
                </div>
              </div>
            )}

          </section>
        </div>
      ) : (
        <EmptyState
          title="Nenhuma inception selecionada"
          description="Crie uma inception para começar."
        />
      )}
    </>
  );
}




