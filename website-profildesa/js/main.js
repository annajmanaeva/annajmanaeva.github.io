/**
 * WEBSITE PROFIL DESA BINORONG - MAIN JS
 * Digunakan untuk mengatur Navigasi, Footer Otomatis, dan Form Pengaduan Melayang.
 */

document.addEventListener("DOMContentLoaded", function() {
    
    // ==========================================
    // MODULE 1: INISIALISASI & AMBIL UTILITY PATH
    // ==========================================
    // Deteksi tanda jangkar utama pada placeholder HTML
    const pengaduanPlace = document.getElementById("pengaduan-placeholder");
    const footerElement = document.getElementById("footer-placeholder");
    
    // Menentukan path level (./ untuk root, ../ jika di dalam sub-folder profil/sotk)
    const currentPath = pengaduanPlace?.getAttribute("data-path") || 
                        footerElement?.getAttribute("data-path") || "./";


    // ==========================================
    // MODULE 2: MUAT FOOTER SECARA OTOMATIS
    // ==========================================
    if (footerElement) {
        fetch(currentPath + "footer.html")
            .then(response => {
                if (!response.ok) throw new Error("File footer.html tidak ditemukan");
                return response.text();
            })
            .then(data => { 
                footerElement.innerHTML = data; 
                // Jalankan kalkulasi posisi tombol melayang setelah footer masuk ke DOM
                adjustFloatingButton();
            })
            .catch(error => {
                console.warn("Gagal memuat footer eksternal:", error);
                // Tetap jalankan kalkulasi agar tombol tidak rusak posisinya
                adjustFloatingButton();
            });
    }


    // ==========================================
    // MODULE 3: MUAT KOMPONEN FORM PENGADUAN
    // ==========================================
    if (pengaduanPlace) {
        fetch(currentPath + "components/pengaduan.html")
            .then(response => {
                if (!response.ok) throw new Error("Gagal mengambil komponen pengaduan.html");
                return response.text();
            })
            .then(htmlData => {
                pengaduanPlace.innerHTML = htmlData;
                
                // Nyalakan seluruh logika interaktivitas form pengaduan setelah HTML-nya siap
                initPengaduanLogic();
            })
            .catch(err => console.error("Sistem Pengaduan Error:", err));
    }


    // ==========================================
    // MODULE 4: LOGIKA INTERAKTIVITAS PENGADUAN
    // ==========================================
    function initPengaduanLogic() {
        // Menyesuaikan ID/Class target agar klop dengan struktur widget direct
        const btnTrigger = document.getElementById("btnTriggerPengaduanDirect") || document.getElementById("btnTriggerPengaduan");
        const cardForm = document.getElementById("cardPengaduan");
        const formAduan = document.getElementById("formAduan");
        const fileInput = document.getElementById("fileLampiranDirect") || document.getElementById("fileLampiran");
        const fileNameText = document.getElementById("fileNameDirectText") || document.getElementById("fileNameText");

        if (btnTrigger && cardForm) {
            // Berikan default style transisi halus sesuai konsep gambar melayang
            cardForm.style.opacity = '0';
            cardForm.style.transform = 'translateY(20px)';
            cardForm.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

            // Aksi Buka Tutup Form Pengaduan
            btnTrigger.addEventListener("click", function(e) {
                e.stopPropagation();
                if (cardForm.style.display === "none" || cardForm.style.display === "") {
                    cardForm.style.display = "block";
                    setTimeout(() => {
                        cardForm.style.opacity = "1";
                        cardForm.style.transform = "translateY(0)";
                    }, 10);
                    btnTrigger.innerHTML = '<i class="fa-solid fa-xmark me-2"></i> Tutup';
                } else {
                    tutupFormAduan();
                }
            });

            // Menutup form jika klik di luar area form pengaduan
            document.addEventListener("click", function(e) {
                if (!cardForm.contains(e.target) && !btnTrigger.contains(e.target)) {
                    if (cardForm.style.display === "block") {
                        tutupFormAduan();
                    }
                }
            });
        }

        function tutupFormAduan() {
            if (!cardForm || !btnTrigger) return;
            cardForm.style.opacity = "0";
            cardForm.style.transform = "translateY(20px)";
            btnTrigger.innerHTML = '<i class="fa-solid fa-envelope me-2"></i> Pengaduan';
            setTimeout(() => {
                cardForm.style.display = "none";
                adjustFloatingButton();
            }, 300);
        }

        // Interaksi input file (Mengubah teks menjadi nama file asli saat diunggah)
        if (fileInput && fileNameText) {
            fileInput.addEventListener("change", function() {
                if (this.files.length > 0) {
                    fileNameText.innerText = this.files[0].name;
                    fileNameText.style.color = "#000000"; // Teks jadi hitam saat file masuk
                    fileNameText.classList.remove("text-muted");
                } else {
                    fileNameText.innerText = "Unggah foto/PDF jika ada";
                    fileNameText.style.color = "";
                    fileNameText.classList.add("text-muted");
                }
            });
        }

        // Submit Form -> Loading Spinner -> Munculkan Bootstrap Modal Sukses
        if (formAduan) {
            formAduan.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const submitBtn = document.getElementById("btnSubmitDirect") || formAduan.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                
                // Berikan efek loading pada tombol kirim
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Kirim';

                setTimeout(() => {
                    // Sembunyikan form kembali
                    tutupFormAduan();

                    // Tampilkan Popup Modal Pemberitahuan Terkirim
                    const targetModal = document.getElementById('modalDirectTerkirim') || document.getElementById('modalTerkirim');
                    if (targetModal) {
                        const myModal = new bootstrap.Modal(targetModal);
                        myModal.show();
                    } else {
                        alert("Pengaduan Berhasil Dikirim!");
                    }
                    
                    // Reset isi form aduan
                    formAduan.reset();
                    if(fileNameText) {
                        fileNameText.innerText = "Unggah foto/PDF jika ada";
                        fileNameText.classList.add("text-muted");
                        fileNameText.style.color = "";
                    }
                    
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }, 1200);
            });
        }
    }


    // ==========================================
    // MODULE 5: PENGUNCI TOMBOL DI ATAS FOOTER
    // ==========================================
    function adjustFloatingButton() {
        // Mendeteksi pembungkus form melayang (baik class wrapper bawaan maupun container direct)
        const floatingDiv = document.querySelector('.floating-pengaduan-wrapper') || document.querySelector('.floating-pengaduan-container');
        const targetFooter = document.querySelector('footer') || document.getElementById('footer-placeholder');
        
        if (targetFooter && floatingDiv) {
            const footerTop = targetFooter.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            // Jika posisi atas area footer mulai naik menampakkan diri ke layar
            if (footerTop < windowHeight) {
                const targetBottom = (windowHeight - footerTop + 25);
                floatingDiv.style.bottom = targetBottom + 'px';
            } else {
                floatingDiv.style.bottom = '25px'; // Posisi mengambang bebas di kanan bawah layar biasa
            }
        }
    }

    // Sambungkan fungsi kalkulasi posisi ke event interaksi jendela browser
    window.addEventListener('scroll', adjustFloatingButton);
    window.addEventListener('resize', adjustFloatingButton);


    // ==========================================
    // MODULE 6: HERO SCROLLED SECTION (OPSIONAL)
    // ==========================================
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                heroSection.classList.add('scrolled');
            } else {
                heroSection.classList.remove('scrolled');
            }
        });
    }

});