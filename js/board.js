document.querySelectorAll('.zoom button').forEach(b => b.onclick = () => {
    document.getElementById('board').style.zoom = b.dataset.z;
    document.querySelectorAll('.zoom button').forEach(x => x.classList.toggle('on', x === b))
});
