function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildQTIItem(question, index) {
  const id = `item_${index + 1}`
  const correctId = `correct_${index + 1}`
  const responses = (question.options || []).map((opt, i) => ({
    id: `response_${index + 1}_${i}`,
    text: opt,
    isCorrect: i === question.correctIndex,
  }))

  const choiceInteractionChoices = responses
    .map((r) => `              <simpleChoice identifier="${r.id}">${escapeXml(r.text)}</simpleChoice>`)
    .join('\n')

  return `      <item identifier="${id}" title="${escapeXml(question.question)}">
        <itemBody>
          <choiceInteraction shuffle="false" maxChoices="1" responseIdentifier="${correctId}">
            <prompt>${escapeXml(question.question)}</prompt>
${choiceInteractionChoices}
          </choiceInteraction>
        </itemBody>
        <responseDeclaration identifier="${correctId}" cardinality="single" baseType="identifier">
          <correctResponse><value>${responses.find((r) => r.isCorrect)?.id || responses[0]?.id}</value></correctResponse>
        </responseDeclaration>
      </item>`
}

export function exportToQTI(game) {
  if (!game || game.gameType !== 'quiz' || !game.content?.questions) {
    return null
  }

  const items = game.content.questions
    .filter((q) => q.options && q.options.length > 0)
    .map((q, i) => buildQTIItem(q, i))
    .join('\n')

  const qtiXml = `<?xml version="1.0" encoding="UTF-8"?>
<questestinterop xmlns="http://www.imsglobal.org/xsd/ims_qtiasiv1p2">
  <assessment ident="${game.id || 'assessment'}" title="${escapeXml(game.title)}">
    <qtimetadata>
      <qtimetadatafield>
        <fieldlabel>cc_maxattempts</fieldlabel>
        <fieldentry>0</fieldentry>
      </qtimetadatafield>
    </qtimetadata>
    <section ident="root_section">
${items}
    </section>
  </assessment>
</questestinterop>`

  return qtiXml
}

export function downloadQTI(game) {
  const xml = exportToQTI(game)
  if (!xml) return false

  const blob = new Blob([xml], { type: 'application/xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${game.title.replace(/[^a-zA-Z0-9]/g, '_')}_QTI.xml`
  a.click()
  URL.revokeObjectURL(url)
  return true
}
