const promptInput = document.getElementById("prompt")
const styleSelect = document.getElementById("style")
const resolutionSelect = document.getElementById("resolution")
const qualitySelect = document.getElementById("quality")
const countSelect = document.getElementById("count")
const generateBtn = document.getElementById("generateBtn")
const resultsDiv = document.getElementById("results")
const loadingSpinner = document.querySelector(".loading-spinner")
const btnText = document.querySelector(".btn-text")
const resultsHeader = document.querySelector(".results-header")

let isGenerating = false

generateBtn.addEventListener("click", generateImages)

promptInput.addEventListener("keypress", e => {
	if (e.key === "Enter" && e.ctrlKey) {
		generateImages()
	}
})

function showGenerationStatus(success, count) {
	let existingStatus = document.getElementById("generation-status")
	if (existingStatus) existingStatus.remove()

	const statusDiv = document.createElement("div")
	statusDiv.id = "generation-status"
	statusDiv.style.marginBottom = "8px"
	statusDiv.style.fontSize = "16px"
	statusDiv.style.fontWeight = "bold"
	statusDiv.style.display = "flex"
	statusDiv.style.alignItems = "center"
	statusDiv.style.gap = "6px"
	statusDiv.style.justifyContent = "center"
	statusDiv.style.margin = "8px auto"

	const icon = document.createElement("span")
	icon.style.fontSize = "20px"
	icon.style.display = "inline-block"

	if (success) {
		icon.textContent = "✔"
		icon.style.color = "green"
		statusDiv.textContent = `Успешно сгенерировано изображений: ${count}`
	} else {
		icon.textContent = "✘"
		icon.style.color = "red"
		statusDiv.textContent = `Не удалось сгенерировать изображения.`
	}

	statusDiv.prepend(icon)
	resultsHeader.after(statusDiv)
}

async function generateImagesCards(prompt, count, resolution, style, quality) {
	const imageGrid = document.createElement("div")
	imageGrid.className = "image-grid"

	let loadedCount = 0
	let processedCount = 0

	for (let i = 0; i < count; i++) {
		const imageCard = document.createElement("div")
		imageCard.className = "image-card"
		const enhancedPrompt = `${prompt}, ${style}, style, high quality, detailed`
		const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
			enhancedPrompt
		)}?width=${resolution.split("x")[0]}&height=${
			resolution.split("x")[1]
		}&seed=${Date.now() + i}&nologo=true`

		imageCard.innerHTML = `
      <div class="image-container">
        <img
          class="generatedImage"
          src="${imageUrl}"
          alt="Generated Image: ${prompt}"
          loading="lazy"
        />
        <div class="image-overlay">Нажмите, чтобы открыть</div>
      </div>
      <div class="image-info">
        <div class="image-prompt">${prompt}</div>
        <div class="image-details">
          <span>${resolution}</span>
          <span>${style}</span>
          <span>${quality}</span>
        </div>
        <div class="under-div">
          <button class="download-btn" onclick="downloadImage('${imageUrl}', '${prompt.substring(
			0,
			30
		)}')">Скачать</button>
          <button class="open-btn" onclick="openImageModal('${imageUrl}', '${prompt.substring(
			0,
			30
		)}')">Открыть</button>
        </div>
      </div>
    `

		const img = imageCard.querySelector("img")
		img.onload = () => {
			img.style.opacity = "1"
			loadedCount++
			processedCount++
			if (processedCount === count) {
				showGenerationStatus(loadedCount > 0, loadedCount)
			}
		}
		img.onerror = () => {
			img.parentElement.innerHTML =
				'<div class="image-placeholder">Ошибка Генерации</div>'
			processedCount++
			if (processedCount === count) {
				showGenerationStatus(loadedCount > 0, loadedCount)
			}
		}

		imageGrid.appendChild(imageCard)
	}

	resultsDiv.appendChild(imageGrid)

	if (count === 0) {
		showGenerationStatus(false, 0)
	}
}

function generateImages() {
	const prompt = promptInput.value.trim()

	if (!prompt) {
		showStatusMessage("error", "Введите ваш запрос.")
		showGenerationStatus(false, 0)
		return
	}

	if (isGenerating) return

	isGenerating = true
	generateBtn.disabled = true
	loadingSpinner.style.display = "inline-block"
	btnText.textContent = "Генерация..."
	resultsDiv.innerHTML = ""
	showStatusMessage(
		"info",
		"Генерация Изображения... Это может занять некоторое время."
	)

	const oldStatus = document.getElementById("generation-status")
	if (oldStatus) oldStatus.remove()

	setTimeout(() => {
		const imageCount = parseInt(countSelect.value)
		const resolution = resolutionSelect.value
		const style = styleSelect.value
		const quality = qualitySelect.value

		generateImagesCards(prompt, imageCount, resolution, style, quality).then(
			() => {
				isGenerating = false
				generateBtn.disabled = false
				loadingSpinner.style.display = "none"
				btnText.textContent = "Генерировать"
			}
		)
	}, 2000)
}

function showStatusMessage(type, message) {
	const existingMessage = document.querySelector(".status-message")
	if (existingMessage) {
		existingMessage.remove()
	}

	const statusDiv = document.createElement("div")
	statusDiv.className = `status-message status-${type}`
	statusDiv.textContent = message

	resultsDiv.insertBefore(statusDiv, resultsDiv.firstChild)

	if (type === "success" || type === "info") {
		setTimeout(() => {
			if (statusDiv.parentNode) {
				statusDiv.remove()
			}
		}, 5000)
	}
}

const samplePrompts = [
	"A majestic mountain landscape at golden hour with a crystal clear lake reflecting the peaks",
	"A futuristic robot sitting in a cozy library reading a book",
	"An ancient Japanese temple surrounded by cherry blossoms in full bloom",
	"A steampunk airship floating above a Victorian city at sunset",
	"A magical forest with glowing mushrooms and ethereal light filtering through the trees",
]

document.addEventListener("click", e => {
	if (e.target.closest(".placeholder") && !promptInput.value.trim()) {
		const randomPrompt =
			samplePrompts[Math.floor(Math.random() * samplePrompts.length)]
		promptInput.value = randomPrompt
		promptInput.focus()
	}
})

async function downloadImage(imageUrl, filename) {
	try {
		const response = await fetch(imageUrl, { mode: "cors" })
		if (!response.ok) throw new Error("Ошибка загрузки изображения")

		const blob = await response.blob()

		const blobUrl = URL.createObjectURL(blob)

		const link = document.createElement("a")
		link.href = blobUrl
		link.download = `ai-generated-${filename
			.replace(/[^a-z0-9]/gi, "-")
			.toLowerCase()}.jpg`
		document.body.appendChild(link)
		link.click()

		document.body.removeChild(link)
		URL.revokeObjectURL(blobUrl)
	} catch (error) {
		alert(
			"Не удалось скачать изображение. Попробуйте открыть и сохранить вручную."
		)
		console.error("Download error:", error)
	}
}

function openImageModal(imageUrl, prompt) {
	const modal = document.createElement("div")
	modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); display: flex; align-items: center;
            justify-content: center; z-index: 1000; cursor: pointer;
        `
	modal.innerHTML = `
            <div style="max-width: 90%; max-height: 90%; position: relative;">
                <img src="${imageUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 8px;">
                <div style="position: absolute; top: -40px; left: 0; right: 0; text-align: center; color: white; font-size: 0.9rem;">
                    "${prompt}"
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="position: absolute; top: -40px; right: 0; background: #ff4444; color: white; border: none; 
                               border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 1.2rem;">×</button>
            </div>
        `
	modal.onclick = e => {
		if (e.target === modal) modal.remove()
	}
	document.body.appendChild(modal)
}
