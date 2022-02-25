FROM esydev/esy:nightly-alpine-latest as builder
WORKDIR /app

# Copy the rest of the files
COPY . .

# TODO: investigate why esy complains that it's not installed if we don't install again
RUN esy install
RUN esy build_static
RUN esy cp "#{self.target_dir / 'default' / 'src' / 'bin' / 'votes_cronjob.exe'}" votes_cronjob.exe 

RUN strip ./votes_cronjob.exe

FROM tezos/tezos:master
RUN sudo apk add curl lz4 xz jq
COPY --from=builder /votes_cronjob.exe ./
ENTRYPOINT ["./votes_cronjob.exe"]
CMD [""]
