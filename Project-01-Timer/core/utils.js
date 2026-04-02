// 生成唯一ID
export function generateId() {
    const ts = Date.now()
    const rand = Math.random().toString(36).slice(2, 8)
    return `task_${ts}_${rand}`
}
// 格式化时间
export function format(timestamp) {
    if (!timestamp) return ''
    const d = new Date(timestamp)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    const ss = String(d.getSeconds()).padStart(2, '0')
    return `${y}-${m}-${dd} ${hh}:${mm}:${ss}`
}