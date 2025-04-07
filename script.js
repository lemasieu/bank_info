// Tải dữ liệu từ file data.json
fetch('data.json')
    .then(response => response.json())
    .then(banks => {
        const searchInput = document.getElementById('searchInput');
        const fieldSelect = document.getElementById('field');
        const suggestionsList = document.getElementById('suggestions');
        let selectedSuggestionIndex = -1;

        // Hàm tra cứu ngân hàng
        window.searchBank = function() {
            const field = fieldSelect.value;
            const query = searchInput.value.toLowerCase();
            const resultBody = document.getElementById('resultBody');
            resultBody.innerHTML = ''; // Xóa kết quả cũ

            const filteredBanks = banks.filter(bank => {
                const value = bank[field];
                if (Array.isArray(value)) {
                    return value.some(item => item.toLowerCase().includes(query));
                }
                return value && value.toLowerCase().includes(query);
            });

            if (filteredBanks.length === 0) {
                resultBody.innerHTML = '<tr><td colspan="7">Không tìm thấy kết quả</td></tr>';
                return;
            }

            filteredBanks.forEach(bank => {
                const row = document.createElement('tr');
                // Nếu có next_name, thêm class highlight-next-name
                if (bank.next_name) {
                    row.classList.add('highlight-next-name');
                }
                row.innerHTML = `
                    <td>${bank.full_vn_name}</td>
                    <td>${bank.full_name}</td>
                    <td>${bank.short_name.join(', ')}</td>
                    <td>${bank.stock_code || ''} / ${bank.swift_code || ''}</td>
                    <td>${bank.type}</td>
                    <td><a href="${bank.website || ''}" target="_blank">${bank.website || ''}</a></td>
                    <td>
                        <div class="app-icons">
                            ${bank.link_app_ios ? `<a href="${bank.link_app_ios}" target="_blank" class="app-icon app-store"><i class="fa-brands fa-app-store"></i></a>` : ''}
                            ${bank.link_app_android ? `<a href="${bank.link_app_android}" target="_blank" class="app-icon google-play"><i class="fa-brands fa-google-play"></i></a>` : ''}
                        </div>
                    </td>
                `;
                resultBody.appendChild(row);
            });

            // Ẩn gợi ý sau khi tra cứu
            suggestionsList.style.display = 'none';
        };

        // Hàm hiển thị gợi ý
        function showSuggestions() {
            const field = fieldSelect.value;
            const query = searchInput.value.toLowerCase();
            suggestionsList.innerHTML = '';

            if (!query) {
                suggestionsList.style.display = 'none';
                return;
            }

            const suggestions = new Set();
            banks.forEach(bank => {
                const value = bank[field];
                if (Array.isArray(value)) {
                    value.forEach(item => {
                        if (item.toLowerCase().includes(query)) {
                            suggestions.add(item);
                        }
                    });
                } else if (value && value.toLowerCase().includes(query)) {
                    suggestions.add(value);
                }
            });

            const suggestionArray = Array.from(suggestions).slice(0, 5);
            if (suggestionArray.length === 0) {
                suggestionsList.style.display = 'none';
                return;
            }

            suggestionArray.forEach((suggestion, index) => {
                const li = document.createElement('li');
                li.textContent = suggestion;
                li.addEventListener('click', () => {
                    searchInput.value = suggestion;
                    suggestionsList.style.display = 'none';
                    searchBank();
                });
                if (index === selectedSuggestionIndex) {
                    li.classList.add('selected');
                }
                suggestionsList.appendChild(li);
            });

            suggestionsList.style.display = 'block';
        }

        // Sự kiện khi nhập vào ô tìm kiếm
        searchInput.addEventListener('input', showSuggestions);

        // Sự kiện khi thay đổi trường tra cứu
        fieldSelect.addEventListener('change', () => {
            searchInput.value = '';
            suggestionsList.style.display = 'none';
        });

        // Sự kiện Enter để tìm kiếm
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchBank();
            }
        });

        // Điều hướng gợi ý bằng phím mũi tên
        searchInput.addEventListener('keydown', function(e) {
            const suggestions = suggestionsList.getElementsByTagName('li');
            if (suggestions.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestions.length - 1);
                updateSuggestionHighlight();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
                updateSuggestionHighlight();
            } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
                e.preventDefault();
                searchInput.value = suggestions[selectedSuggestionIndex].textContent;
                suggestionsList.style.display = 'none';
                searchBank();
            }
        });

        // Cập nhật highlight cho gợi ý được chọn
        function updateSuggestionHighlight() {
            const suggestions = suggestionsList.getElementsByTagName('li');
            for (let i = 0; i < suggestions.length; i++) {
                suggestions[i].classList.remove('selected');
                if (i === selectedSuggestionIndex) {
                    suggestions[i].classList.add('selected');
                    suggestions[i].scrollIntoView({ block: 'nearest' });
                }
            }
        }

        // Ẩn gợi ý khi click ra ngoài
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !suggestionsList.contains(e.target)) {
                suggestionsList.style.display = 'none';
            }
        });
    })
    .catch(error => console.error('Lỗi khi tải dữ liệu:', error));